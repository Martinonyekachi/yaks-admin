import { useMemo, useState } from 'react'
import {
  ArrowDownUp, Banknote, CalendarDays, Check, ChevronLeft,
  ChevronRight, CircleDollarSign, CreditCard, Download, FileText, Filter, RotateCcw,
  Search, ShieldCheck, X,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { Avatar, EmptyState, Modal, PageHeading, PanelHeading, StatusBadge } from '../components/UI.jsx'
import { useToast } from '../components/toast-context.js'
import {
  initialTransactions, paymentMethodColors, paymentMethods, transactionStatuses, transactionTypes,
} from '../data/transactions.js'
import { downloadCSV } from '../utils/csv.js'

const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
const chartTooltipStyle = { background: '#242831', border: '1px solid #343943', borderRadius: 5, color: '#f5f6fa', fontSize: 11 }

function formatNaira(value) {
  return currency.format(value)
}

function formatDate(value) {
  return dateFormatter.format(new Date(value))
}

function transactionDateKey(value) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function TransactionFilter({ label, value, options, onChange }) {
  return <label className="select-wrap transaction-select"><Filter size={13} /><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function toCsvRows(rows) {
  return [
    ['Transaction ID', 'Reference', 'Customer', 'Customer email', 'Date', 'Payment method', 'Amount (NGN)', 'Type', 'Status', 'Gateway reference'],
    ...rows.map((row) => [row.id, row.reference, row.customer.name, row.customer.email, row.date, row.method, row.amount, row.type, row.status, row.gatewayReference]),
  ]
}

function appendHistory(row, title, detail) {
  return {
    ...row,
    history: [...row.history, { title, detail, date: new Date().toISOString() }],
  }
}

function buildAnalytics(rows) {
  const monthMap = new Map()
  rows.forEach((row) => {
    const date = new Date(row.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        month: new Intl.DateTimeFormat('en-NG', { month: 'short' }).format(date),
        sortKey: date.getTime(),
        revenue: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        transactions: 0,
      })
    }
    const month = monthMap.get(key)
    month.transactions += 1
    if (row.status === 'Successful') {
      month.successful += 1
      month.revenue += row.amount
    } else if (row.status === 'Failed') {
      month.failed += 1
    } else if (row.status === 'Pending') {
      month.pending += 1
    }
  })

  const monthly = [...monthMap.values()].sort((a, b) => a.sortKey - b.sortKey)
  const methodCounts = paymentMethods.map((method) => ({
    name: method,
    value: rows.filter((row) => row.method === method).length,
    color: paymentMethodColors[method],
  })).filter((method) => method.value > 0)
  return { monthly, methodCounts }
}

function TransactionDetails({ transaction, onClose, onRefund, onStatusChange, onPrint }) {
  return (
    <Modal
      title="Transaction details"
      description={`Reference ${transaction.reference}`}
      onClose={onClose}
      className="transaction-details-modal"
      footer={<div className="transaction-detail-actions">
        <button className="button button-secondary" onClick={onPrint}><FileText size={14} />Print receipt</button>
        {transaction.status === 'Successful' && <button className="button button-danger" onClick={onRefund}><RotateCcw size={14} />Process refund</button>}
        {transaction.status === 'Pending' && <>
          <button className="button button-secondary" onClick={() => onStatusChange('Failed')}>Mark failed</button>
          <button className="button button-primary" onClick={() => onStatusChange('Successful')}><Check size={14} />Mark successful</button>
        </>}
        <button className="button button-secondary" onClick={onClose}>Close</button>
      </div>}
    >
      <div className="transaction-detail-content">
        <div className="transaction-detail-banner">
          <span className="transaction-detail-icon"><CreditCard size={18} /></span>
          <div><span>Transaction amount</span><strong>{formatNaira(transaction.amount)}</strong></div>
          <StatusBadge>{transaction.status}</StatusBadge>
        </div>
        <div className="transaction-detail-columns">
          <section className="transaction-detail-section">
            <h3>Customer information</h3>
            <div className="transaction-info-row"><span>Full name</span><strong>{transaction.customer.name}</strong></div>
            <div className="transaction-info-row"><span>Email address</span><strong>{transaction.customer.email}</strong></div>
            <div className="transaction-info-row"><span>Phone number</span><strong>{transaction.customer.phone}</strong></div>
          </section>
          <section className="transaction-detail-section">
            <h3>Payment information</h3>
            <div className="transaction-info-row"><span>Payment method</span><strong>{transaction.method}</strong></div>
            <div className="transaction-info-row"><span>Transaction type</span><strong>{transaction.type}</strong></div>
            <div className="transaction-info-row"><span>Gateway reference</span><strong>{transaction.gatewayReference}</strong></div>
            <div className="transaction-info-row"><span>Processing fee</span><strong>{formatNaira(transaction.fee)}</strong></div>
            <div className="transaction-info-row"><span>Transaction date</span><strong>{dateTimeFormatter.format(new Date(transaction.date))}</strong></div>
          </section>
        </div>
        <section className="transaction-history">
          <h3>Transaction history</h3>
          <ol>{[...transaction.history].reverse().map((event, index) => <li key={`${event.title}-${event.date}`}><span className={`transaction-history-dot${index === 0 ? ' current' : ''}`} /><div><strong>{event.title}</strong><p>{event.detail}</p><time>{dateTimeFormatter.format(new Date(event.date))}</time></div></li>)}</ol>
        </section>
      </div>
    </Modal>
  )
}

export default function TransactionsPage() {
  const [rows, setRows] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [method, setMethod] = useState('All payment methods')
  const [type, setType] = useState('All types')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sort, setSort] = useState('Newest first')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [selectedId, setSelectedId] = useState(null)
  const [confirmRefund, setConfirmRefund] = useState(false)
  const notify = useToast()

  const dateRows = useMemo(() => rows.filter((row) => {
    const date = transactionDateKey(row.date)
    return (!fromDate || date >= fromDate) && (!toDate || date <= toDate)
  }), [fromDate, rows, toDate])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = dateRows.filter((row) =>
      (!query || `${row.id} ${row.customer.name}`.toLowerCase().includes(query)) &&
      (status === 'All statuses' || row.status === status) &&
      (method === 'All payment methods' || row.method === method) &&
      (type === 'All types' || row.type === type),
    )
    return result.sort((a, b) => {
      if (sort === 'Oldest first') return new Date(a.date) - new Date(b.date)
      if (sort === 'Amount: high to low') return b.amount - a.amount
      if (sort === 'Amount: low to high') return a.amount - b.amount
      return new Date(b.date) - new Date(a.date)
    })
  }, [dateRows, method, search, sort, status, type])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)
  const selected = rows.find((row) => row.id === selectedId)
  const { monthly, methodCounts } = useMemo(() => buildAnalytics(dateRows), [dateRows])
  const totalRevenue = rows.filter((row) => row.status === 'Successful').reduce((sum, row) => sum + row.amount, 0)
  const refundedAmount = rows.reduce((sum, row) => sum + row.refundedAmount, 0)
  const stats = [
    { label: 'Total transactions', value: rows.length.toLocaleString('en-NG'), note: 'All recorded payments', icon: ArrowDownUp, tone: 'blue' },
    { label: 'Total revenue', value: formatNaira(totalRevenue), note: 'Successful payments only', icon: CircleDollarSign, tone: 'green' },
    { label: 'Successful', value: rows.filter((row) => row.status === 'Successful').length.toLocaleString('en-NG'), note: 'Funds confirmed', icon: ShieldCheck, tone: 'green' },
    { label: 'Pending', value: rows.filter((row) => row.status === 'Pending').length.toLocaleString('en-NG'), note: 'Awaiting settlement', icon: CalendarDays, tone: 'amber' },
    { label: 'Failed', value: rows.filter((row) => row.status === 'Failed').length.toLocaleString('en-NG'), note: 'Not completed', icon: X, tone: 'red' },
    { label: 'Refunded amount', value: formatNaira(refundedAmount), note: 'Refunds issued', icon: RotateCcw, tone: 'violet' },
  ]
  const hasFilters = search || status !== 'All statuses' || method !== 'All payment methods' || type !== 'All types' || fromDate || toDate

  function resetPage() {
    setPage(1)
  }

  function resetFilters() {
    setSearch('')
    setStatus('All statuses')
    setMethod('All payment methods')
    setType('All types')
    setFromDate('')
    setToDate('')
    setSort('Newest first')
    setPage(1)
  }

  function exportRows() {
    downloadCSV('yaks-transactions.csv', toCsvRows(filteredRows))
    notify(`${filteredRows.length} filtered transaction${filteredRows.length === 1 ? '' : 's'} exported`)
  }

  function updateStatus(nextStatus) {
    if (!selected) return
    const title = nextStatus === 'Successful' ? 'Payment confirmed' : 'Payment marked failed'
    const detail = nextStatus === 'Successful' ? 'Administrator confirmed payment settlement' : 'Administrator marked this payment as unsuccessful'
    const updated = appendHistory({ ...selected, status: nextStatus }, title, detail)
    setRows((current) => current.map((row) => row.id === selected.id ? updated : row))
    setSelectedId(updated.id)
    notify(`Transaction marked ${nextStatus.toLowerCase()}`)
  }

  function refundSelected() {
    if (!selected || selected.status !== 'Successful') return
    const updated = appendHistory({ ...selected, status: 'Refunded', refundedAmount: selected.amount }, 'Refund issued', 'Full refund recorded to the original payment method')
    setRows((current) => current.map((row) => row.id === selected.id ? updated : row))
    setSelectedId(updated.id)
    setConfirmRefund(false)
    notify('Sample refund recorded')
  }

  function printReceipt(transaction) {
    window.print()
    notify(`Print dialog opened for ${transaction.id}`)
  }

  return <div className="workspace-page transactions-page">
    <PageHeading
      eyebrow="FINANCE"
      title="Transactions & Financial Management"
      description="Monitor payment activity, revenue and refunds across your workspace."
      actions={<button className="button button-secondary" onClick={exportRows}><Download size={15} />Export filtered CSV</button>}
    />

    <div className="transaction-overview" aria-label="Transaction summary">
      {stats.map(({ label, value, note, icon: Icon, tone }) => <article className="panel transaction-overview-card" key={label}>
        <div className="transaction-overview-heading"><span className="stat-label">{label}</span><span className={`metric-icon metric-${tone}`}><Icon size={16} /></span></div>
        <strong className="transaction-overview-value">{value}</strong>
        <span className="transaction-overview-note">{note}</span>
      </article>)}
    </div>

    <section className="transaction-analytics" aria-label="Financial analytics">
      <article className="panel transaction-chart-panel">
        <PanelHeading title="Revenue trends" subtitle="Successful transaction value by month" />
        <div className="transaction-chart"><ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly} margin={{ top: 14, right: 12, left: 3, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 10 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} tickFormatter={(value) => `₦${Math.round(value / 1000000)}m`} width={42} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [formatNaira(value), 'Revenue']} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#5685ff" strokeWidth={2.2} dot={{ r: 3, fill: '#5685ff', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer></div>
        {!monthly.length && <p className="chart-empty">No transactions in this date range.</p>}
      </article>

      <article className="panel transaction-chart-panel">
        <PanelHeading title="Transaction outcomes" subtitle="Successful and failed payments by month" />
        <div className="transaction-chart"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly} margin={{ top: 14, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} dy={8} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="successful" name="Successful" fill="#62c6a5" radius={[3, 3, 0, 0]} />
            <Bar dataKey="failed" name="Failed" fill="#e58484" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer></div>
        {!monthly.length && <p className="chart-empty">No transactions in this date range.</p>}
      </article>

      <article className="panel transaction-chart-panel transaction-method-panel">
        <PanelHeading title="Payment methods" subtitle="Transaction share by method" />
        {methodCounts.length ? <div className="transaction-method-content">
          <div className="transaction-method-chart"><ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={methodCounts} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="88%" paddingAngle={3} stroke="none">{methodCounts.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} /></PieChart>
          </ResponsiveContainer></div>
          <div className="transaction-method-legend">{methodCounts.map((item) => <div key={item.name}><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
        </div> : <EmptyState title="No payment data" description="Transactions in the selected date range will appear here." />}
      </article>
    </section>

    <section className="panel transaction-table-panel">
      <PanelHeading title="Transaction history" subtitle="Search, filter and review individual payments" action={<span className="transaction-record-count">{filteredRows.length} records</span>} />
      <div className="transaction-filter-bar">
        <label className="table-search transaction-search"><Search size={15} /><input placeholder="Search ID or customer name..." aria-label="Search transaction ID or customer name" value={search} onChange={(event) => { setSearch(event.target.value); resetPage() }} /></label>
        <div className="transaction-filter-controls">
          <TransactionFilter label="Filter transaction status" value={status} options={['All statuses', ...transactionStatuses]} onChange={(value) => { setStatus(value); resetPage() }} />
          <TransactionFilter label="Filter payment method" value={method} options={['All payment methods', ...paymentMethods]} onChange={(value) => { setMethod(value); resetPage() }} />
          <TransactionFilter label="Filter transaction type" value={type} options={['All types', ...transactionTypes]} onChange={(value) => { setType(value); resetPage() }} />
          <label className="transaction-sort"><ArrowDownUp size={13} /><select aria-label="Sort transactions" value={sort} onChange={(event) => { setSort(event.target.value); resetPage() }}><option>Newest first</option><option>Oldest first</option><option>Amount: high to low</option><option>Amount: low to high</option></select></label>
        </div>
      </div>
      <div className="transaction-date-filters">
        <span><CalendarDays size={14} />Date range</span>
        <label>From<input type="date" aria-label="Transactions from date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); resetPage() }} /></label>
        <label>To<input type="date" aria-label="Transactions to date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); resetPage() }} /></label>
        {hasFilters && <button className="text-button transaction-reset" onClick={resetFilters}><X size={13} />Clear filters</button>}
      </div>
      <div className="table-scroll transaction-table-scroll">
        <table className="data-table transaction-data-table">
          <thead><tr>
            <th>TRANSACTION ID</th><th>CUSTOMER</th><th>DATE</th><th>PAYMENT METHOD</th><th>AMOUNT</th><th>TYPE</th><th>STATUS</th><th aria-label="Actions"></th>
          </tr></thead>
          <tbody>{visibleRows.map((row) => <tr key={row.id}>
            <td><button className="transaction-id-button" onClick={() => setSelectedId(row.id)}>{row.id}</button></td>
            <td><div className="table-person"><Avatar initials={row.initials} color={row.color} size="small" /><span><strong>{row.customer.name}</strong><small>{row.customer.email}</small></span></div></td>
            <td>{formatDate(row.date)}</td><td>{row.method}</td><td className="amount-cell">{formatNaira(row.amount)}</td><td>{row.type}</td>
            <td><StatusBadge>{row.status}</StatusBadge></td>
            <td><button className="icon-button row-more" aria-label={`View transaction ${row.id}`} onClick={() => setSelectedId(row.id)}><FileText size={15} /></button></td>
          </tr>)}</tbody>
        </table>
        {!visibleRows.length && <EmptyState title="No transactions found" description="Change or clear the selected search and filters to see matching transactions." />}
      </div>
      <div className="transaction-pagination">
        <label>Rows per page<select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}><option value={8}>8</option><option value={12}>12</option><option value={24}>24</option></select></label>
        <span>Showing <strong>{filteredRows.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredRows.length)}</strong> of <strong>{filteredRows.length}</strong></span>
        <div className="pagination-buttons"><button className="icon-button" disabled={safePage === 1} aria-label="Previous transaction page" onClick={() => setPage(safePage - 1)}><ChevronLeft size={17} /></button><span>Page {safePage} of {pageCount}</span><button className="icon-button" disabled={safePage === pageCount} aria-label="Next transaction page" onClick={() => setPage(safePage + 1)}><ChevronRight size={17} /></button></div>
      </div>
    </section>

    <section className="panel transaction-monthly-panel">
      <PanelHeading title="Monthly transaction summary" subtitle="Payment volume and confirmed revenue by month" />
      <div className="table-scroll"><table className="data-table monthly-transactions-table">
        <thead><tr><th>MONTH</th><th>TRANSACTIONS</th><th>SUCCESSFUL</th><th>FAILED</th><th>PENDING</th><th>CONFIRMED REVENUE</th></tr></thead>
        <tbody>{[...monthly].reverse().map((month) => <tr key={month.sortKey}><td className="monthly-name">{month.month}</td><td>{month.transactions}</td><td>{month.successful}</td><td>{month.failed}</td><td>{month.pending}</td><td className="amount-cell">{formatNaira(month.revenue)}</td></tr>)}</tbody>
      </table>{!monthly.length && <EmptyState title="No monthly activity" description="Choose a wider date range to view a summary." />}</div>
    </section>

    {selected && <TransactionDetails
      transaction={selected}
      onClose={() => setSelectedId(null)}
      onRefund={() => setConfirmRefund(true)}
      onStatusChange={updateStatus}
      onPrint={() => printReceipt(selected)}
    />}
    {confirmRefund && selected && <Modal
      title="Confirm sample refund"
      description={`Refund ${selected.reference}`}
      onClose={() => setConfirmRefund(false)}
      footer={<><button className="button button-secondary" onClick={() => setConfirmRefund(false)}>Cancel</button><button className="button button-danger" onClick={refundSelected}><RotateCcw size={14} />Confirm refund</button></>}
    >
      <div className="transaction-refund-confirm"><span className="transaction-refund-icon"><Banknote size={19} /></span><p>This records a local sample refund of <strong>{formatNaira(selected.amount)}</strong> for <strong>{selected.customer.name}</strong>. No payment provider or bank will be contacted.</p></div>
    </Modal>}
    {selected && <div className="transaction-print-receipt" aria-hidden="true">
      <div className="print-receipt-brand"><span className="brand-symbol"><i /><i /><i /></span><strong>Yaks Admin</strong><small>PAYMENT RECEIPT</small></div>
      <h1>Transaction receipt</h1><p className="print-receipt-status">{selected.status}</p>
      <div><span>Transaction ID</span><strong>{selected.id}</strong></div><div><span>Reference</span><strong>{selected.reference}</strong></div>
      <div><span>Customer</span><strong>{selected.customer.name}</strong></div><div><span>Email</span><strong>{selected.customer.email}</strong></div>
      <div><span>Date</span><strong>{dateTimeFormatter.format(new Date(selected.date))}</strong></div><div><span>Payment method</span><strong>{selected.method}</strong></div>
      <div><span>Transaction type</span><strong>{selected.type}</strong></div><div className="print-receipt-total"><span>Amount paid</span><strong>{formatNaira(selected.amount)}</strong></div>
      <p className="print-receipt-note">This receipt reflects locally stored sample transaction data.</p>
    </div>}
  </div>
}
