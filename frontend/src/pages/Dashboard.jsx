import { useMemo, useState } from 'react'
import {
  ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, CreditCard, Download,
  Filter, MoreHorizontal, Search, Users, Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  activities, dashboardRevenueData, dashboardTransactions, formatNaira,
  dashboardMetrics, revenueDistributionData, userAcquisitionData,
} from '../data/dashboard.js'
import { Avatar, EmptyState, PanelHeading, StatusBadge } from '../components/UI.jsx'
import { useAdminSettings } from '../components/settings-context.jsx'
import { useToast } from '../components/toast-context.js'
import { downloadCSV } from '../utils/csv.js'

const chartTooltipStyle = {
  background: '#242831',
  border: '1px solid #343943',
  borderRadius: 4,
  color: '#f5f6fa',
  fontSize: 12,
}

const activityIcons = {
  user: Users,
  folder: BriefcaseBusiness,
  credit: CreditCard,
  settings: Wallet,
}

const metricIcons = {
  users: Users,
  projects: BriefcaseBusiness,
  revenue: Wallet,
  growth: ArrowUpRight,
}

function MetricCard({ label, value, change, note, icon: Icon, tone }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className={`metric-icon metric-${tone}`}><Icon size={18} strokeWidth={1.8} /></span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom">
        <span className="change-pill"><ArrowUpRight size={14} />{change}</span>
        <span className="metric-note">{note}</span>
      </div>
    </article>
  )
}

function ComparisonTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.filter((item) => item.value != null).map((item) => (
        <span key={item.dataKey}>
          <i className="tooltip-dot" style={{ backgroundColor: item.color }} />
          {item.name}
          <b>{formatter(item.value)}</b>
        </span>
      ))}
    </div>
  )
}

function Dashboard() {
  const { profile } = useAdminSettings()
  const [range, setRange] = useState('This year')
  const [transactionQuery, setTransactionQuery] = useState('')
  const [transactionStatus, setTransactionStatus] = useState('All statuses')
  const notify = useToast()
  const [date] = useState(() => new Intl.DateTimeFormat('en-NG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()))

  const rangeLength = range === 'Last 30 days' ? 1 : range === 'Last 90 days' ? 3 : dashboardRevenueData.length
  const revenueChartData = useMemo(() => dashboardRevenueData.slice(-rangeLength), [rangeLength])
  const acquisitionChartData = useMemo(() => userAcquisitionData.slice(-rangeLength), [rangeLength])
  const revenueTotals = useMemo(() => revenueChartData.reduce((totals, month) => ({
    current: totals.current + month.revenue,
    previous: totals.previous + month.previousRevenue,
  }), { current: 0, previous: 0 }), [revenueChartData])
  const acquisitionTotals = useMemo(() => acquisitionChartData.reduce((totals, month) => ({
    current: totals.current + month.users,
    previous: totals.previous + month.previousUsers,
  }), { current: 0, previous: 0 }), [acquisitionChartData])
  const revenueChange = revenueTotals.previous
    ? `${((revenueTotals.current / revenueTotals.previous - 1) * 100).toFixed(1)}%`
    : '0%'
  const acquisitionChange = acquisitionTotals.previous
    ? `${((acquisitionTotals.current / acquisitionTotals.previous - 1) * 100).toFixed(1)}%`
    : '0%'
  const revenueTotal = revenueDistributionData.reduce((total, item) => total + item.value, 0)
  const periodLabel = range === 'This year' ? 'Jan — Nov 2026' : range === 'Last 90 days' ? 'Sep — Nov 2026' : 'Nov 2026'
  const visibleTransactions = useMemo(() => {
    const query = transactionQuery.trim().toLowerCase()
    return dashboardTransactions.filter((transaction) => {
      const matchesStatus = transactionStatus === 'All statuses' || transaction.status === transactionStatus
      const matchesSearch = !query || `${transaction.id} ${transaction.customer} ${transaction.email}`.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [transactionQuery, transactionStatus])

  function exportReport() {
    const rows = [
      ['Yaks dashboard report', range],
      ['Metric', 'Value', 'Change vs. previous period'],
      ...dashboardMetrics.map(({ label, value, change }) => [label, value, change]),
      [],
      ['Month', 'Revenue', 'Previous period'],
      ...revenueChartData.map((month) => [month.month, formatNaira(month.revenue), formatNaira(month.previousRevenue)]),
      [],
      ['Month', 'New users', 'Previous period'],
      ...acquisitionChartData.map((month) => [month.month, month.users, month.previousUsers]),
      [],
      ['Transaction ID', 'Customer', 'Date', 'Amount', 'Payment method', 'Status'],
      ...dashboardTransactions.map((transaction) => [
        transaction.id,
        transaction.customer,
        transaction.date,
        formatNaira(transaction.amount),
        transaction.method,
        transaction.status,
      ]),
    ]
    downloadCSV('yaks-dashboard-report.csv', rows)
    notify('Dashboard report exported')
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <div className="eyebrow welcome-date"><CalendarDays size={13} />{date}</div>
          <h1>Good morning, {profile.name}</h1>
          <p className="page-description">Here's what's happening across your workspace.</p>
        </div>
        <div className="heading-actions">
          <label className="select-wrap date-select">
            <CalendarDays size={15} />
            <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Select date range">
              <option>This year</option>
              <option>Last 90 days</option>
              <option>Last 30 days</option>
            </select>
          </label>
          <button className="button button-secondary" onClick={exportReport}><Download size={16} />Export Report</button>
        </div>
      </div>

      <section className="metrics-grid" aria-label="Key metrics">
        {dashboardMetrics.map(({ icon, ...metric }) => <MetricCard key={metric.label} {...metric} icon={metricIcons[icon]} />)}
      </section>

      <section className="dashboard-chart-grid">
        <article className="panel revenue-panel">
          <PanelHeading
            title="Revenue overview"
            subtitle="Monthly revenue and previous-period comparison"
            action={<button className="icon-button panel-more" aria-label="Revenue chart details" onClick={() => notify(`Revenue view: ${range.toLowerCase()}`)}><MoreHorizontal size={19} /></button>}
          />
          <div className="chart-summary">
            <strong>{formatNaira(revenueTotals.current)}</strong>
            <span className="change-pill"><ArrowUpRight size={13} />{revenueChange}</span>
            <small>vs. previous period</small>
          </div>
          <div className="revenue-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 10, right: 6, left: -13, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 10 }} tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}m`} />
                <Tooltip content={<ComparisonTooltip formatter={formatNaira} />} cursor={{ stroke: '#4b5362', strokeDasharray: '4 4' }} />
                <Line name="Current period" type="monotone" dataKey="revenue" stroke="#5685ff" strokeWidth={2.2} dot={{ r: 3, fill: '#5685ff', stroke: '#1c1f26', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#5685ff', stroke: '#1c1f26', strokeWidth: 3 }} />
                <Line name="Previous period" type="monotone" dataKey="previousRevenue" stroke="#777f90" strokeWidth={1.7} strokeDasharray="5 4" dot={{ r: 2, fill: '#777f90', stroke: '#1c1f26', strokeWidth: 1 }} activeDot={{ r: 4, fill: '#a7afbf', stroke: '#1c1f26', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <span><i className="legend-line" />Current period</span>
            <span><i className="legend-line legend-muted" />Previous period</span>
            <span className="chart-period">{periodLabel}</span>
          </div>
        </article>

        <article className="panel growth-panel">
          <PanelHeading title="User acquisition" subtitle="New accounts by month" />
          <div className="growth-total">
            {acquisitionTotals.current.toLocaleString('en-NG')}
            <span className="change-pill"><ArrowUpRight size={13} />{acquisitionChange}</span>
          </div>
          <div className="growth-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={acquisitionChartData} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#2b2e36" strokeDasharray="3 5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#858c9a', fontSize: 9 }} />
                <Tooltip content={<ComparisonTooltip formatter={(value) => value.toLocaleString('en-NG')} />} contentStyle={chartTooltipStyle} />
                <Line name="New users" type="monotone" dataKey="users" stroke="#62c6a5" strokeWidth={2} dot={{ r: 2, fill: '#62c6a5', stroke: '#1c1f26', strokeWidth: 1 }} activeDot={{ r: 4, fill: '#62c6a5', stroke: '#1c1f26', strokeWidth: 2 }} />
                <Line name="Previous period" type="monotone" dataKey="previousUsers" stroke="#777f90" strokeWidth={1.5} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <span><i className="legend-line legend-green" />New users</span>
            <span><i className="legend-line legend-muted" />Previous period</span>
            <span className="chart-period">{periodLabel}</span>
          </div>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="panel activity-panel">
          <PanelHeading
            title="Recent activity"
            subtitle="The latest updates from your workspace"
            action={<Link className="text-button" to="/notifications">View all <ArrowRight size={14} /></Link>}
          />
          <div className="activity-list">
            {activities.map((item) => {
              const Icon = activityIcons[item.icon]
              return (
                <div className="activity-item" key={item.title}>
                  <span className={`activity-icon tone-${item.tone}`}><Icon size={16} /></span>
                  <div className="activity-copy"><strong>{item.title}</strong><span>{item.detail}</span></div>
                  <time>{item.time}</time>
                </div>
              )
            })}
          </div>
        </article>
        <article className="panel distribution-panel">
          <PanelHeading title="Revenue distribution" subtitle="Revenue by product stream" />
          <div className="distribution-content">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueDistributionData} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="91%" paddingAngle={4} stroke="none">
                    {revenueDistributionData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [formatNaira(value), 'Revenue']} contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-label"><strong>₦24.85m</strong><span>total revenue</span></div>
            </div>
            <div className="distribution-legend">
              {revenueDistributionData.map((item) => (
                <div key={item.name}>
                  <span><i style={{ backgroundColor: item.color }} />{item.name}</span>
                  <strong>{Math.round((item.value / revenueTotal) * 100)}%</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="panel transactions-panel">
        <PanelHeading
          title="Recent transactions"
          subtitle="A snapshot of your latest payments"
          action={<Link className="text-button" to="/transactions">All transactions <ArrowRight size={14} /></Link>}
        />
        <div className="table-toolbar dashboard-table-toolbar">
          <label className="table-search">
            <Search size={16} />
            <input value={transactionQuery} onChange={(event) => setTransactionQuery(event.target.value)} placeholder="Search ID or customer..." aria-label="Search recent transactions" />
          </label>
          <label className="select-wrap">
            <Filter size={14} />
            <select value={transactionStatus} onChange={(event) => setTransactionStatus(event.target.value)} aria-label="Filter transactions by status">
              <option>All statuses</option>
              <option>Successful</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table className="data-table transaction-table">
            <thead><tr><th>TRANSACTION ID</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>PAYMENT METHOD</th><th>STATUS</th></tr></thead>
            <tbody>
              {visibleTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="transaction-id">{transaction.id}</td>
                  <td><div className="table-person"><Avatar initials={transaction.initials} color={transaction.color} size="small" /><span><strong>{transaction.customer}</strong><small>{transaction.email}</small></span></div></td>
                  <td>{transaction.date}</td>
                  <td className="amount-cell">{formatNaira(transaction.amount)}</td>
                  <td>{transaction.method}</td>
                  <td><StatusBadge>{transaction.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleTransactions.length && <EmptyState title="No transactions found" description="Try a different search or payment status." />}
        </div>
        <div className="table-footer">
          <span>Showing <strong>{visibleTransactions.length}</strong> of {dashboardTransactions.length} transactions</span>
          <Link className="button button-quiet" to="/transactions">View transactions <ArrowRight size={14} /></Link>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
