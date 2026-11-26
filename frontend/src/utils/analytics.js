import { revenueGrowthBaseline, userCountSnapshots } from '../data/analytics.js'

const DAY_MS = 24 * 60 * 60 * 1000

export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseDateKey(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function shiftDate(value, days) {
  const date = parseDateKey(value)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

export function getPeriodRange(period, referenceDate = new Date()) {
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
  const start = new Date(end)

  if (period === 'Daily') start.setDate(start.getDate() - 29)
  if (period === 'Weekly') start.setDate(start.getDate() - 83)
  if (period === 'Monthly') start.setMonth(start.getMonth() - 11, 1)
  if (period === 'Yearly') start.setFullYear(start.getFullYear() - 2, 0, 1)

  return { startDate: dateKey(start), endDate: dateKey(end) }
}

export function filterByDateRange(items, dateField, startDate, endDate) {
  if (!startDate || !endDate || startDate > endDate) return []
  return items.filter((item) => {
    const itemDate = item[dateField].slice(0, 10)
    return itemDate >= startDate && itemDate <= endDate
  })
}

function createBuckets(startDate, endDate, period) {
  if (!startDate || !endDate || startDate > endDate) return []
  const first = parseDateKey(startDate)
  const last = parseDateKey(endDate)
  const buckets = []

  if (period === 'Daily') {
    for (const cursor = new Date(first); cursor <= last; cursor.setDate(cursor.getDate() + 1)) {
      const key = dateKey(cursor)
      buckets.push({ startDate: key, endDate: key, label: new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(cursor) })
    }
    return buckets
  }

  if (period === 'Weekly') {
    for (const cursor = new Date(first); cursor <= last; cursor.setDate(cursor.getDate() + 7)) {
      const bucketEnd = new Date(cursor)
      bucketEnd.setDate(bucketEnd.getDate() + 6)
      const end = bucketEnd < last ? bucketEnd : last
      buckets.push({
        startDate: dateKey(cursor),
        endDate: dateKey(end),
        label: new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(cursor),
      })
    }
    return buckets
  }

  const cursor = period === 'Yearly'
    ? new Date(first.getFullYear(), 0, 1)
    : new Date(first.getFullYear(), first.getMonth(), 1)
  while (cursor <= last) {
    const next = new Date(cursor)
    if (period === 'Yearly') next.setFullYear(next.getFullYear() + 1)
    else next.setMonth(next.getMonth() + 1)
    const bucketEnd = new Date(next.getTime() - DAY_MS)
    const clippedStart = cursor < first ? first : cursor
    const clippedEnd = bucketEnd > last ? last : bucketEnd
    buckets.push({
      startDate: dateKey(clippedStart),
      endDate: dateKey(clippedEnd),
      label: period === 'Yearly'
        ? String(cursor.getFullYear())
        : new Intl.DateTimeFormat('en-NG', { month: 'short', year: '2-digit' }).format(cursor),
    })
    cursor.setTime(next.getTime())
  }
  return buckets
}

function rowsInBucket(rows, dateField, bucket) {
  return rows.filter((item) => {
    const itemDate = item[dateField].slice(0, 10)
    return itemDate >= bucket.startDate && itemDate <= bucket.endDate
  })
}

function revenueFor(rows) {
  return rows.filter((row) => row.status === 'Successful').reduce((total, row) => total + row.amount, 0)
}

export function getUserTotalAsOf(date) {
  const snapshots = userCountSnapshots.filter((snapshot) => snapshot.date <= date)
  return snapshots.length ? snapshots[snapshots.length - 1].totalUsers : userCountSnapshots[0].totalUsers
}

export function getPreviousDateRange(startDate, endDate) {
  if (!startDate || !endDate || startDate > endDate) return { startDate: '', endDate: '' }
  const days = Math.round((parseDateKey(endDate) - parseDateKey(startDate)) / DAY_MS) + 1
  const previousEnd = shiftDate(startDate, -1)
  return { startDate: shiftDate(previousEnd, -(days - 1)), endDate: previousEnd }
}

export function getAnalyticsSummary(transactions, users, startDate, endDate) {
  const currentTransactions = filterByDateRange(transactions, 'date', startDate, endDate)
  const currentUsers = filterByDateRange(users, 'registeredAt', startDate, endDate)
  const previousRange = getPreviousDateRange(startDate, endDate)
  const previousTransactions = filterByDateRange(transactions, 'date', previousRange.startDate, previousRange.endDate)
  const successfulCount = currentTransactions.filter((row) => row.status === 'Successful').length
  const failedCount = currentTransactions.filter((row) => row.status === 'Failed').length
  const refundedCount = currentTransactions.filter((row) => row.status === 'Refunded').length
  const revenue = revenueFor(currentTransactions)
  const previousRevenue = revenueFor(previousTransactions)
  const completedAttempts = successfulCount + failedCount + refundedCount

  return {
    totalRevenue: revenue,
    totalUsers: getUserTotalAsOf(endDate),
    newUsers: currentUsers.length,
    totalTransactions: currentTransactions.length,
    successfulCount,
    pendingCount: currentTransactions.filter((row) => row.status === 'Pending').length,
    failedCount,
    refundedCount,
    successRate: completedAttempts ? (successfulCount / completedAttempts) * 100 : 0,
    revenueGrowth: previousRevenue
      ? ((revenue - previousRevenue) / previousRevenue) * 100
      : revenue ? revenueGrowthBaseline : null,
    revenueGrowthIsBaseline: !previousRevenue && revenue > 0,
    averageTransactionValue: successfulCount ? Math.round(revenue / successfulCount) : 0,
    currentTransactions,
    currentUsers,
    previousTransactions,
  }
}

export function buildAnalyticsSeries(transactions, users, startDate, endDate, period) {
  const currentBuckets = createBuckets(startDate, endDate, period)
  if (!currentBuckets.length) return []
  const previousRange = getPreviousDateRange(startDate, endDate)
  const previousBuckets = createBuckets(previousRange.startDate, previousRange.endDate, period)

  return currentBuckets.map((bucket, index) => {
    const bucketTransactions = rowsInBucket(transactions, 'date', bucket)
    const bucketUsers = rowsInBucket(users, 'registeredAt', bucket)
    const previousTransactions = rowsInBucket(transactions, 'date', previousBuckets[index] || { startDate: '', endDate: '' })
    const previousUsers = rowsInBucket(users, 'registeredAt', previousBuckets[index] || { startDate: '', endDate: '' })
    const successful = bucketTransactions.filter((row) => row.status === 'Successful').length
    const failed = bucketTransactions.filter((row) => row.status === 'Failed').length
    const refunded = bucketTransactions.filter((row) => row.status === 'Refunded').length
    const completedAttempts = successful + failed + refunded

    return {
      ...bucket,
      revenue: revenueFor(bucketTransactions),
      previousRevenue: revenueFor(previousTransactions),
      newUsers: bucketUsers.length,
      previousNewUsers: previousUsers.length,
      transactions: bucketTransactions.length,
      successful,
      pending: bucketTransactions.filter((row) => row.status === 'Pending').length,
      failed,
      refunded,
      successRate: completedAttempts ? (successful / completedAttempts) * 100 : 0,
    }
  })
}

export function formatReportDateRange(startDate, endDate) {
  const formatter = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${formatter.format(parseDateKey(startDate))} – ${formatter.format(parseDateKey(endDate))}`
}
