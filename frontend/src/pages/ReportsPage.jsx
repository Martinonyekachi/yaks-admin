import { useMemo, useState } from 'react'
import {
  BarChart3, CalendarDays, Check, CircleDollarSign, Download, FileText, Printer, Users,
} from 'lucide-react'
import { downloadCSV } from '../utils/csv.js'
import { useToast } from '../components/toast-context.js'
import { EmptyState, PageHeading } from '../components/UI.jsx'
import { initialTransactions } from '../data/transactions.js'
import { initialUserRecords } from '../data/users.js'
import { formatNaira } from '../data/dashboard.js'
import { filterByDateRange, formatReportDateRange, getAnalyticsSummary, getPeriodRange } from '../utils/analytics.js'

const periods = ['Daily', 'Weekly', 'Monthly', 'Yearly']
const reportCategories = ['Revenue', 'Users', 'Transactions', 'Overall performance']
const generatedDateFormatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' })

function ReportMetric({ label, value }) {
  return <div className="generated-report-metric"><span>{label}</span><strong>{value}</strong></div>
}

function getReportMetrics(report, summary) {
  if (report.category === 'Revenue') {
    return [
      { label: 'Total revenue', value: formatNaira(summary.totalRevenue) },
      { label: 'Revenue growth', value: summary.revenueGrowth === null ? 'No prior-period sample' : `${summary.revenueGrowth.toFixed(1)}%${summary.revenueGrowthIsBaseline ? ' · workspace baseline' : ''}` },
      { label: 'Average transaction', value: formatNaira(summary.averageTransactionValue) },
      { label: 'Transactions', value: summary.totalTransactions.toLocaleString('en-NG') },
    ]
  }
  if (report.category === 'Users') {
    return [
      { label: 'Total registered users', value: summary.totalUsers.toLocaleString('en-NG') },
      { label: 'New registrations', value: summary.newUsers.toLocaleString('en-NG') },
      { label: 'Active sample users', value: initialUserRecords.filter((user) => user.status === 'Active' && user.registeredAt >= report.startDate && user.registeredAt <= report.endDate).length.toLocaleString('en-NG') },
      { label: 'Roles represented', value: new Set(filterByDateRange(initialUserRecords, 'registeredAt', report.startDate, report.endDate).map((user) => user.role)).size.toLocaleString('en-NG') },
    ]
  }
  if (report.category === 'Transactions') {
    return [
      { label: 'Transactions', value: summary.totalTransactions.toLocaleString('en-NG') },
      { label: 'Successful', value: summary.successfulCount.toLocaleString('en-NG') },
      { label: 'Pending', value: summary.pendingCount.toLocaleString('en-NG') },
      { label: 'Failed / refunded', value: (summary.failedCount + summary.refundedCount).toLocaleString('en-NG') },
    ]
  }
  return [
    { label: 'Total revenue', value: formatNaira(summary.totalRevenue) },
    { label: 'Total users', value: summary.totalUsers.toLocaleString('en-NG') },
    { label: 'Transactions', value: summary.totalTransactions.toLocaleString('en-NG') },
    { label: 'Success rate', value: `${summary.successRate.toFixed(1)}%` },
  ]
}

function getReportRows(report) {
  const summary = getAnalyticsSummary(initialTransactions, initialUserRecords, report.startDate, report.endDate)
  const rows = [
    ['Report title', report.title],
    ['Category', report.category],
    ['Date range', `${report.startDate} to ${report.endDate}`],
    ['Generated', generatedDateFormatter.format(new Date(report.generatedAt))],
    [],
    ['Summary metric', 'Value'],
    ...getReportMetrics(report, summary).map(({ label, value }) => [label, value]),
  ]

  if (report.category === 'Revenue' || report.category === 'Transactions' || report.category === 'Overall performance') {
    rows.push([], ['Transaction ID', 'Date', 'Customer', 'Customer email', 'Amount (NGN)', 'Payment method', 'Type', 'Status'])
    rows.push(...summary.currentTransactions.map((transaction) => [
      transaction.id,
      transaction.date,
      transaction.customer.name,
      transaction.customer.email,
      transaction.amount,
      transaction.method,
      transaction.type,
      transaction.status,
    ]))
  }
  if (report.category === 'Users' || report.category === 'Overall performance') {
    rows.push([], ['User ID', 'Full name', 'Email', 'Role', 'Status', 'Registration date'])
    rows.push(...summary.currentUsers.map((user) => [user.id, user.name, user.email, user.role, user.status, user.registeredAt]))
  }
  return rows
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('Monthly')
  const initialRange = getPeriodRange('Monthly')
  const [startDate, setStartDate] = useState(initialRange.startDate)
  const [endDate, setEndDate] = useState(initialRange.endDate)
  const [category, setCategory] = useState('Overall performance')
  const [title, setTitle] = useState('Workspace performance summary')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [reports, setReports] = useState([])
  const [printReportId, setPrintReportId] = useState(null)
  const [validation, setValidation] = useState('')
  const notify = useToast()
  const summary = useMemo(() => getAnalyticsSummary(initialTransactions, initialUserRecords, startDate, endDate), [endDate, startDate])
  const metricsForDraft = getReportMetrics({ category, startDate, endDate }, summary)
  const visibleReports = reports.filter((report) => categoryFilter === 'All categories' || report.category === categoryFilter)
  const isValidRange = startDate && endDate && startDate <= endDate

  function changePeriod(value) {
    setPeriod(value)
    const range = getPeriodRange(value)
    setStartDate(range.startDate)
    setEndDate(range.endDate)
    setValidation('')
  }

  function generateReport(event) {
    event.preventDefault()
    if (!isValidRange) {
      setValidation('Select a start date before or on the end date.')
      return
    }
    if (!title.trim()) {
      setValidation('Enter a title for this report.')
      return
    }
    const report = {
      id: `${Date.now()}-${reports.length + 1}`,
      title: title.trim(),
      category,
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
    }
    setReports((current) => [report, ...current])
    setCategoryFilter('All categories')
    setValidation('')
    notify('Report generated from local sample data')
  }

  function downloadReport(report) {
    downloadCSV(`yaks-${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, getReportRows(report))
    notify(`${report.title} downloaded`)
  }

  function printReport(report) {
    setPrintReportId(report.id)
    window.setTimeout(() => window.print(), 100)
  }

  return <div className="workspace-page reports-page">
    <PageHeading eyebrow="INSIGHTS" title="Reports" description="Generate and download useful, date-aware workspace reports." />

    <section className="panel report-builder-panel">
      <div className="report-builder-heading">
        <span className="report-builder-icon"><FileText size={18} /></span>
        <div><h2>Build a report</h2><p>Select a category and reporting window. Reports use local sample data only.</p></div>
      </div>
      <form className="report-builder-form" onSubmit={generateReport}>
        <label className="report-title-field">Report title<input value={title} onChange={(event) => { setTitle(event.target.value); setValidation('') }} placeholder="e.g. Monthly revenue report" /></label>
        <label>Report category<select aria-label="Report category" value={category} onChange={(event) => setCategory(event.target.value)}>{reportCategories.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Reporting period<select aria-label="Report period" value={period} onChange={(event) => changePeriod(event.target.value)}>{periods.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="report-date-field"><span><CalendarDays size={13} />From</span><input aria-label="Report start date" type="date" value={startDate} max={endDate || undefined} onChange={(event) => { setStartDate(event.target.value); setValidation('') }} /></label>
        <label className="report-date-field"><span>To</span><input aria-label="Report end date" type="date" value={endDate} min={startDate || undefined} onChange={(event) => { setEndDate(event.target.value); setValidation('') }} /></label>
        <button className="button button-primary report-generate-button" type="submit"><Check size={15} />Generate report</button>
      </form>
      {validation && <p className="report-validation" role="alert">{validation}</p>}
      <div className="report-draft-preview">
        <span><CircleDollarSign size={15} />Preview for {isValidRange ? formatReportDateRange(startDate, endDate) : 'a valid date range'}</span>
        <div>{metricsForDraft.map(({ label, value }) => <ReportMetric key={label} label={label} value={value} />)}</div>
      </div>
    </section>

    <section className="generated-reports-section">
      <div className="generated-reports-heading">
        <div><h2>Generated reports</h2><p>Download or print saved report snapshots for this session.</p></div>
        <label className="select-wrap report-category-filter"><span>Category</span><select aria-label="Filter generated reports by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{reportCategories.map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      {visibleReports.length ? <div className="generated-reports-list">{visibleReports.map((report) => {
        const reportSummary = getAnalyticsSummary(initialTransactions, initialUserRecords, report.startDate, report.endDate)
        const reportMetrics = getReportMetrics(report, reportSummary)
        return <article className="panel generated-report-card" key={report.id}>
          <div className="generated-report-header">
            <span className="generated-report-icon">{report.category === 'Users' ? <Users size={17} /> : report.category === 'Transactions' ? <BarChart3 size={17} /> : <CircleDollarSign size={17} />}</span>
            <div><h3>{report.title}</h3><span className="generated-report-category">{report.category}</span></div>
            <div className="generated-report-actions">
              <button className="button button-secondary" onClick={() => downloadReport(report)}><Download size={14} />Download CSV</button>
              <button className="button button-secondary" onClick={() => printReport(report)}><Printer size={14} />Print</button>
            </div>
          </div>
          <div className="generated-report-meta"><span><CalendarDays size={13} />{formatReportDateRange(report.startDate, report.endDate)}</span><span>Generated {generatedDateFormatter.format(new Date(report.generatedAt))}</span></div>
          <div className="generated-report-summary">{reportMetrics.map(({ label, value }) => <ReportMetric key={label} label={label} value={value} />)}</div>
          <div className={`report-print-document${printReportId === report.id ? ' print-active' : ''}`} aria-hidden="true">
            <div className="print-report-brand"><span className="brand-symbol"><i /><i /><i /></span><strong>Yaks Admin</strong><small>ANALYTICS REPORT</small></div>
            <h1>{report.title}</h1>
            <div className="print-report-tags"><span>{report.category}</span><span>{formatReportDateRange(report.startDate, report.endDate)}</span></div>
            <p className="print-report-generated">Generated {generatedDateFormatter.format(new Date(report.generatedAt))}</p>
            <h2>Summary</h2>
            {reportMetrics.map(({ label, value }) => <div className="print-report-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            <p className="print-report-note">This report reflects locally stored Yaks Admin sample data and is not connected to a live backend.</p>
          </div>
        </article>
      })}</div> : <div className="panel generated-reports-empty"><EmptyState title={categoryFilter === 'All categories' ? 'No reports generated yet' : `No ${categoryFilter.toLowerCase()} reports`} description="Choose a report category and date range above, then generate a report to see it here." /></div>}
    </section>
  </div>
}
