import { useMemo, useState } from 'react'
import {
  Activity, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign,
  CreditCard, Download, Users,
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { analyticsColors } from '../data/analytics.js'
import { initialTransactions, paymentMethodColors, paymentMethods } from '../data/transactions.js'
import { initialUserRecords, userStatuses } from '../data/users.js'
import { formatNaira } from '../data/dashboard.js'
import { useToast } from '../components/toast-context.js'
import { EmptyState, PageHeading, PanelHeading } from '../components/UI.jsx'
import { buildAnalyticsSeries, filterByDateRange, getAnalyticsSummary, getPeriodRange } from '../utils/analytics.js'
import { downloadCSV } from '../utils/csv.js'

const periods = ['Daily', 'Weekly', 'Monthly', 'Yearly']
const categories = ['All categories', 'Revenue', 'Users', 'Transactions', 'Performance']
const tooltipStyle = { background: '#242831', border: '1px solid #343943', borderRadius: 5, color: '#f5f6fa', fontSize: 10 }

function AnalyticsSelect({ label, value, options, onChange }) {
  return <label className="select-wrap analytics-control"><span>{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function ChartPanel({ title, subtitle, children, className = '' }) {
  return <section className={`panel insight-chart-panel${className ? ` ${className}` : ''}`}><PanelHeading title={title} subtitle={subtitle} />{children}</section>
}

function NairaAxis({ value }) {
  return `₦${Math.round(value / 1000000)}m`
}

function toAnalyticsCsv(summary, series, period, category, startDate, endDate) {
  const rows = [
    ['Yaks Admin analytics export'],
    ['Category', category],
    ['Period', period],
    ['Date range', `${startDate} to ${endDate}`],
    [],
    ['Summary metric', 'Value'],
    ['Total revenue (NGN)', summary.totalRevenue],
    ['Total users', summary.totalUsers],
    ['New registrations', summary.newUsers],
    ['Total transactions', summary.totalTransactions],
    ['Transaction success rate', `${summary.successRate.toFixed(1)}%`],
    ['Revenue growth', summary.revenueGrowth === null ? 'No previous-period sample' : `${summary.revenueGrowth.toFixed(1)}%${summary.revenueGrowthIsBaseline ? ' (workspace baseline)' : ''}`],
    ['Average transaction value (NGN)', summary.averageTransactionValue],
    [],
    ['Bucket', 'Revenue (NGN)', 'Previous revenue (NGN)', 'New users', 'Transactions', 'Successful', 'Pending', 'Failed', 'Refunded'],
    ...series.map((item) => [item.label, item.revenue, item.previousRevenue, item.newUsers, item.transactions, item.successful, item.pending, item.failed, item.refunded]),
  ]

  if (category === 'Revenue') return rows.filter((row) => !['New registrations', 'Total users'].includes(row[0]))
  if (category === 'Users') return rows.filter((row) => !['Total revenue (NGN)', 'Total transactions', 'Transaction success rate', 'Revenue growth', 'Average transaction value (NGN)'].includes(row[0]))
  return rows
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('Monthly')
  const initialRange = getPeriodRange('Monthly')
  const [startDate, setStartDate] = useState(initialRange.startDate)
  const [endDate, setEndDate] = useState(initialRange.endDate)
  const [category, setCategory] = useState('All categories')
  const notify = useToast()
  const summary = useMemo(() => getAnalyticsSummary(initialTransactions, initialUserRecords, startDate, endDate), [startDate, endDate])
  const series = useMemo(() => buildAnalyticsSeries(initialTransactions, initialUserRecords, startDate, endDate, period), [endDate, period, startDate])
  const userRows = useMemo(() => filterByDateRange(initialUserRecords, 'registeredAt', startDate, endDate), [endDate, startDate])
  const transactionRows = summary.currentTransactions
  const methodDistribution = paymentMethods.map((method) => ({
    name: method,
    value: transactionRows.filter((transaction) => transaction.method === method).length,
    color: paymentMethodColors[method],
  })).filter((item) => item.value > 0)
  const roleDistribution = [...new Set(userRows.map((user) => user.role))].map((role, index) => ({
    name: role,
    value: userRows.filter((user) => user.role === role).length,
    color: ['#5685ff', '#62c6a5', '#e8b65b', '#8f80d8', '#e58484'][index % 5],
  }))
  const statusDistribution = userStatuses.map((status, index) => ({
    name: status,
    value: userRows.filter((user) => user.status === status).length,
    color: ['#62c6a5', '#e8b65b', '#e58484'][index],
  })).filter((item) => item.value > 0)
  const transactionCounts = transactionRows.reduce((counts, transaction) => {
    counts[transaction.status] += 1
    return counts
  }, { Successful: 0, Pending: 0, Failed: 0, Refunded: 0 })
  const isValidRange = startDate && endDate && startDate <= endDate
  const showRevenue = category === 'All categories' || category === 'Revenue'
  const showUsers = category === 'All categories' || category === 'Users'
  const showTransactions = category === 'All categories' || category === 'Transactions'
  const showPerformance = category === 'All categories' || category === 'Performance'
  const metrics = [
    { label: 'Total revenue', value: formatNaira(summary.totalRevenue), note: 'Successful payments in range', icon: CircleDollarSign, tone: 'green' },
    { label: 'Total users', value: summary.totalUsers.toLocaleString('en-NG'), note: `Workspace total as of ${endDate}`, icon: Users, tone: 'blue' },
    { label: 'Total transactions', value: summary.totalTransactions.toLocaleString('en-NG'), note: 'All statuses in range', icon: CreditCard, tone: 'violet' },
    { label: 'Transaction success rate', value: `${summary.successRate.toFixed(1)}%`, note: `${transactionCounts.Successful} successful · ${transactionCounts.Failed} failed`, icon: Activity, tone: 'green' },
    { label: 'Revenue growth', value: summary.revenueGrowth === null ? '—' : `${summary.revenueGrowth > 0 ? '+' : ''}${summary.revenueGrowth.toFixed(1)}%`, note: summary.revenueGrowthIsBaseline ? 'Workspace baseline · no prior sample' : summary.revenueGrowth === null ? 'No revenue in selected period' : 'vs. previous matching period', icon: ArrowUpRight, tone: 'amber' },
    { label: 'Average transaction value', value: formatNaira(summary.averageTransactionValue), note: 'Successful payments in range', icon: BarChart3, tone: 'blue' },
  ]

  function changePeriod(value) {
    setPeriod(value)
    const range = getPeriodRange(value)
    setStartDate(range.startDate)
    setEndDate(range.endDate)
  }

  function exportAnalytics() {
    if (!isValidRange) {
      notify('Choose a valid date range before exporting')
      return
    }
    downloadCSV(`yaks-analytics-${category.toLowerCase().replaceAll(' ', '-')}.csv`, toAnalyticsCsv(summary, series, period, category, startDate, endDate))
    notify('Filtered analytics exported')
  }

  return <div className="workspace-page analytics-page">
    <PageHeading eyebrow="INSIGHTS" title="Analytics" description="Explore revenue, user activity and transaction performance across your workspace." actions={<><Link className="button button-secondary" to="/reports"><BarChart3 size={15} />Reports</Link><button className="button button-primary" onClick={exportAnalytics}><Download size={15} />Export analytics</button></>} />
    <div className="analytics-filter-bar">
      <AnalyticsSelect label="Reporting period" value={period} options={periods} onChange={changePeriod} />
      <AnalyticsSelect label="Analytics category" value={category} options={categories} onChange={setCategory} />
      <label className="analytics-date-input"><CalendarDays size={14} /><span>From</span><input aria-label="Analytics start date" type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label className="analytics-date-input"><span>To</span><input aria-label="Analytics end date" type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} /></label>
      <span className="analytics-sample-note">Local sample data · not connected to a live backend</span>
    </div>
    {!isValidRange && <div className="analytics-validation" role="alert">Select a start date before or on the end date.</div>}

    <div className="analytics-overview-grid">
      {metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="panel analytics-overview-card" key={label}>
        <div><span className={`metric-icon metric-${tone}`}><Icon size={16} /></span><span className="metric-label">{label}</span></div>
        <strong>{value}</strong><small>{note}</small>
      </article>)}
    </div>

    <div className="analytics-insights-grid">
      {showRevenue && <ChartPanel title="Revenue performance" subtitle="Successful revenue compared with the previous matching period" className="insight-chart-wide">
        {series.length ? <div className="insight-chart"><ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs><linearGradient id="insightRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={analyticsColors.revenue} stopOpacity={0.2} /><stop offset="100%" stopColor={analyticsColors.revenue} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} minTickGap={18} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} tickFormatter={NairaAxis} width={47} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatNaira(value), '']} />
            <Legend wrapperStyle={{ color: '#9299a7', fontSize: 9 }} />
            <Area type="monotone" dataKey="revenue" name="Selected period" stroke={analyticsColors.revenue} strokeWidth={2.2} fill="url(#insightRevenueFill)" activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="previousRevenue" name="Previous period" stroke={analyticsColors.previous} strokeWidth={1.8} strokeDasharray="5 4" dot={false} activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer></div> : <EmptyState title="No revenue data" description="Adjust the selected date range to view revenue trends." />}
      </ChartPanel>}

      {showUsers && <ChartPanel title="User growth" subtitle="New sample registrations by reporting interval">
        {series.length ? <div className="insight-chart"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} minTickGap={20} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9299a7', fontSize: 9 }} />
            <Bar dataKey="newUsers" name="Selected period" fill={analyticsColors.users} radius={[3, 3, 0, 0]} />
            <Bar dataKey="previousNewUsers" name="Previous period" fill={analyticsColors.previous} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer></div> : <EmptyState title="No registration data" description="No sample registrations fall within this date range." />}
      </ChartPanel>}

      {showTransactions && <ChartPanel title="Transaction performance" subtitle="Successful, pending, failed and refunded transactions">
        {series.length ? <div className="insight-chart"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} minTickGap={20} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9299a7', fontSize: 9 }} />
            <Bar dataKey="successful" name="Successful" stackId="status" fill={analyticsColors.successful} />
            <Bar dataKey="pending" name="Pending" stackId="status" fill={analyticsColors.pending} />
            <Bar dataKey="failed" name="Failed" stackId="status" fill={analyticsColors.failed} />
            <Bar dataKey="refunded" name="Refunded" stackId="status" fill={analyticsColors.refunded} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer></div> : <EmptyState title="No transaction data" description="No sample transactions fall within this date range." />}
      </ChartPanel>}

      {showTransactions && <ChartPanel title="Payment method distribution" subtitle="Payment methods used in the selected date range">
        {methodDistribution.length ? <div className="insight-distribution">
          <div className="insight-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={methodDistribution} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none">{methodDistribution.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div>
          <div className="insight-legend">{methodDistribution.map((item) => <div key={item.name}><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
        </div> : <EmptyState title="No payment data" description="Choose a date range with transactions to see payment methods." />}
      </ChartPanel>}

      {showUsers && <ChartPanel title="User distribution by role" subtitle={`${userRows.length} sample registrations in the selected date range`}>
        {roleDistribution.length ? <div className="insight-distribution">
          <div className="insight-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={roleDistribution} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none">{roleDistribution.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div>
          <div className="insight-legend">{roleDistribution.map((item) => <div key={item.name}><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
        </div> : <EmptyState title="No user data" description="No sample registrations fall within this date range." />}
      </ChartPanel>}

      {showUsers && <ChartPanel title="User account status" subtitle="Active, inactive and suspended accounts in the selected range">
        {statusDistribution.length ? <div className="insight-distribution">
          <div className="insight-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none">{statusDistribution.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div>
          <div className="insight-legend">{statusDistribution.map((item) => <div key={item.name}><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
        </div> : <EmptyState title="No account activity" description="No sample users fall within this date range." />}
      </ChartPanel>}

      {showPerformance && <ChartPanel title="Business performance" subtitle="Revenue and transaction volume by interval" className="insight-chart-wide">
        {series.length ? <div className="insight-chart"><ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 10, right: 9, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} minTickGap={20} />
            <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} tickFormatter={NairaAxis} width={47} />
            <YAxis yAxisId="transactions" orientation="right" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} width={28} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [name === 'Revenue' ? formatNaira(value) : value, name]} />
            <Legend wrapperStyle={{ color: '#9299a7', fontSize: 9 }} />
            <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue" stroke={analyticsColors.revenue} fill="#5685ff22" />
            <Line yAxisId="transactions" type="monotone" dataKey="transactions" name="Transactions" stroke={analyticsColors.users} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer></div> : <EmptyState title="No performance data" description="Choose a wider date range to see performance trends." />}
      </ChartPanel>}
    </div>

    <section className="panel analytics-period-summary">
      <PanelHeading title="Selected-period summary" subtitle={`${startDate} to ${endDate} · ${period.toLowerCase()} view`} />
      <div className="analytics-summary-strip">{[
        ['Successful', transactionCounts.Successful, analyticsColors.successful],
        ['Pending', transactionCounts.Pending, analyticsColors.pending],
        ['Failed', transactionCounts.Failed, analyticsColors.failed],
        ['Refunded', transactionCounts.Refunded, analyticsColors.refunded],
        ['New registrations', userRows.length, analyticsColors.users],
      ].map(([label, value, color]) => <div key={label}><span><i style={{ backgroundColor: color }} />{label}</span><strong>{value}</strong></div>)}</div>
      <div className="analytics-summary-foot"><span>Revenue: <strong>{formatNaira(summary.totalRevenue)}</strong></span><span>Average successful transaction: <strong>{formatNaira(summary.averageTransactionValue)}</strong></span><button className="text-button" onClick={() => notify('Analytics are based on local sample records')}>About this data</button></div>
    </section>
  </div>
}
