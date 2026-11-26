export const revenueData = [
  { month: 'Jan', revenue: 28600, users: 820 },
  { month: 'Feb', revenue: 31800, users: 910 },
  { month: 'Mar', revenue: 29400, users: 870 },
  { month: 'Apr', revenue: 36200, users: 1030 },
  { month: 'May', revenue: 39700, users: 1120 },
  { month: 'Jun', revenue: 35400, users: 1080 },
  { month: 'Jul', revenue: 42800, users: 1210 },
  { month: 'Aug', revenue: 46100, users: 1360 },
  { month: 'Sep', revenue: 43700, users: 1280 },
  { month: 'Oct', revenue: 51800, users: 1490 },
  { month: 'Nov', revenue: 56300, users: 1620 },
]

export const dashboardRevenueData = [
  { month: 'Jan', revenue: 1820000, previousRevenue: 1550000 },
  { month: 'Feb', revenue: 1950000, previousRevenue: 1620000 },
  { month: 'Mar', revenue: 2020000, previousRevenue: 1680000 },
  { month: 'Apr', revenue: 2110000, previousRevenue: 1760000 },
  { month: 'May', revenue: 2160000, previousRevenue: 1800000 },
  { month: 'Jun', revenue: 2240000, previousRevenue: 1840000 },
  { month: 'Jul', revenue: 2310000, previousRevenue: 1920000 },
  { month: 'Aug', revenue: 2420000, previousRevenue: 1980000 },
  { month: 'Sep', revenue: 2360000, previousRevenue: 1900000 },
  { month: 'Oct', revenue: 2550000, previousRevenue: 2050000 },
  { month: 'Nov', revenue: 2910000, previousRevenue: 2850000 },
]

export const dashboardMetrics = [
  { label: 'Total Users', value: '12,840', change: '8.4%', note: 'vs. previous period', icon: 'users', tone: 'blue' },
  { label: 'Active Projects', value: '284', change: '12.2%', note: 'vs. previous period', icon: 'projects', tone: 'violet' },
  { label: 'Total Revenue', value: '₦24,850,000', change: '18.6%', note: 'vs. previous period', icon: 'revenue', tone: 'green' },
  { label: 'Growth Rate', value: '18.6%', change: '2.4 pts', note: 'vs. previous period', icon: 'growth', tone: 'amber' },
]

export const userAcquisitionData = [
  { month: 'Jan', users: 820, previousUsers: 710 },
  { month: 'Feb', users: 905, previousUsers: 760 },
  { month: 'Mar', users: 990, previousUsers: 820 },
  { month: 'Apr', users: 1020, previousUsers: 845 },
  { month: 'May', users: 1085, previousUsers: 900 },
  { month: 'Jun', users: 1140, previousUsers: 920 },
  { month: 'Jul', users: 1180, previousUsers: 950 },
  { month: 'Aug', users: 1210, previousUsers: 980 },
  { month: 'Sep', users: 1325, previousUsers: 1020 },
  { month: 'Oct', users: 1430, previousUsers: 1100 },
  { month: 'Nov', users: 1735, previousUsers: 1150 },
]

export const revenueDistributionData = [
  { name: 'Subscriptions', value: 12400000, color: '#5685ff' },
  { name: 'Services', value: 6350000, color: '#62c6a5' },
  { name: 'Enterprise', value: 4300000, color: '#e8b65b' },
  { name: 'Add-ons', value: 1800000, color: '#8f80d8' },
]

export const activityData = [
  { name: 'Projects', value: 38, color: '#5685ff' },
  { name: 'Accounts', value: 27, color: '#49b89a' },
  { name: 'Payments', value: 22, color: '#e8b65b' },
  { name: 'Other', value: 13, color: '#707888' },
]

export const activities = [
  { icon: 'user', tone: 'blue', title: 'New user registered', detail: 'Olivia Rhye joined the workspace', time: '12 min ago' },
  { icon: 'folder', tone: 'green', title: 'Project status updated', detail: 'Mobile App Redesign moved to review', time: '48 min ago' },
  { icon: 'credit', tone: 'amber', title: 'Successful transaction', detail: 'Invoice INV-2026-088 · ₦2,450,000', time: '2 hours ago' },
  { icon: 'settings', tone: 'violet', title: 'Account settings updated', detail: 'Two-factor authentication enabled', time: '3 hours ago' },
]

export const dashboardTransactions = [
  { id: 'TXN-260291', customer: 'Olivia Rhye', email: 'olivia@northstar.ng', date: 'Nov 26, 2026', amount: 2450000, method: 'Visa ···· 4242', status: 'Successful', initials: 'OR', color: 'peach' },
  { id: 'TXN-260290', customer: 'Phoenix Baker', email: 'phoenix@northstar.ng', date: 'Nov 26, 2026', amount: 890000, method: 'Mastercard ···· 8210', status: 'Pending', initials: 'PB', color: 'purple' },
  { id: 'TXN-260289', customer: 'Lana Steiner', email: 'lana@northstar.ng', date: 'Nov 25, 2026', amount: 1240000, method: 'Bank transfer', status: 'Successful', initials: 'LS', color: 'mint' },
  { id: 'TXN-260288', customer: 'Demi Wilkinson', email: 'demi@northstar.ng', date: 'Nov 25, 2026', amount: 320000, method: 'Paystack', status: 'Failed', initials: 'DW', color: 'blue' },
  { id: 'TXN-260287', customer: 'Candice Wu', email: 'candice@northstar.ng', date: 'Nov 24, 2026', amount: 3180000, method: 'Visa ···· 6024', status: 'Successful', initials: 'CW', color: 'gold' },
]

export const transactions = [
  { id: 'TXN-840291', customer: 'Olivia Rhye', email: 'olivia@acme.co', date: 'Nov 26, 2026', amount: 2450, method: 'Visa ···· 4242', status: 'Successful', initials: 'OR', color: 'peach' },
  { id: 'TXN-840290', customer: 'Phoenix Baker', email: 'phoenix@acme.co', date: 'Nov 26, 2026', amount: 890, method: 'Mastercard ···· 8210', status: 'Pending', initials: 'PB', color: 'purple' },
  { id: 'TXN-840289', customer: 'Lana Steiner', email: 'lana@acme.co', date: 'Nov 25, 2026', amount: 1240, method: 'Visa ···· 1138', status: 'Successful', initials: 'LS', color: 'mint' },
  { id: 'TXN-840288', customer: 'Demi Wilkinson', email: 'demi@acme.co', date: 'Nov 25, 2026', amount: 320, method: 'PayPal', status: 'Failed', initials: 'DW', color: 'blue' },
  { id: 'TXN-840287', customer: 'Candice Wu', email: 'candice@acme.co', date: 'Nov 24, 2026', amount: 3180, method: 'Visa ···· 6024', status: 'Successful', initials: 'CW', color: 'gold' },
]

export const users = [
  { name: 'Olivia Rhye', email: 'olivia@acme.co', role: 'Administrator', status: 'Active', joined: 'Nov 26, 2026', initials: 'OR', color: 'peach' },
  { name: 'Phoenix Baker', email: 'phoenix@acme.co', role: 'Member', status: 'Active', joined: 'Nov 24, 2026', initials: 'PB', color: 'purple' },
  { name: 'Lana Steiner', email: 'lana@acme.co', role: 'Member', status: 'Active', joined: 'Nov 21, 2026', initials: 'LS', color: 'mint' },
  { name: 'Demi Wilkinson', email: 'demi@acme.co', role: 'Member', status: 'Invited', joined: 'Nov 19, 2026', initials: 'DW', color: 'blue' },
  { name: 'Candice Wu', email: 'candice@acme.co', role: 'Manager', status: 'Active', joined: 'Nov 17, 2026', initials: 'CW', color: 'gold' },
  { name: 'Natali Craig', email: 'natali@acme.co', role: 'Member', status: 'Inactive', joined: 'Nov 12, 2026', initials: 'NC', color: 'pink' },
  { name: 'Drew Cano', email: 'drew@acme.co', role: 'Member', status: 'Active', joined: 'Nov 09, 2026', initials: 'DC', color: 'green' },
  { name: 'Andi Lane', email: 'andi@acme.co', role: 'Manager', status: 'Active', joined: 'Nov 04, 2026', initials: 'AL', color: 'lavender' },
  { name: 'Kate Morrison', email: 'kate@acme.co', role: 'Member', status: 'Invited', joined: 'Oct 28, 2026', initials: 'KM', color: 'rose' },
  { name: 'John Smith', email: 'john@acme.co', role: 'Member', status: 'Active', joined: 'Oct 21, 2026', initials: 'JS', color: 'slate' },
]

export const projects = [
  { name: 'Mobile App Redesign', team: 'Product design', lead: 'Olivia Rhye', due: 'Dec 12, 2026', progress: 78, status: 'In progress', color: 'blue' },
  { name: 'Q4 Growth Campaign', team: 'Marketing', lead: 'Candice Wu', due: 'Dec 18, 2026', progress: 54, status: 'In progress', color: 'violet' },
  { name: 'Customer Portal', team: 'Engineering', lead: 'Phoenix Baker', due: 'Jan 08, 2027', progress: 32, status: 'At risk', color: 'amber' },
  { name: 'Brand refresh', team: 'Brand studio', lead: 'Lana Steiner', due: 'Nov 30, 2026', progress: 100, status: 'Completed', color: 'green' },
  { name: 'Analytics migration', team: 'Engineering', lead: 'Drew Cano', due: 'Jan 22, 2027', progress: 15, status: 'In progress', color: 'blue' },
]

export const notifications = [
  { category: 'Payments', icon: 'credit', title: 'Payment of $2,450 received', body: 'Olivia Rhye completed invoice INV-2026-088.', time: '12 minutes ago', unread: true },
  { category: 'Projects', icon: 'folder', title: 'Project moved to review', body: 'Mobile App Redesign is ready for your review.', time: '48 minutes ago', unread: true },
  { category: 'Users', icon: 'user', title: 'A new team member joined', body: 'Olivia Rhye accepted her workspace invitation.', time: '2 hours ago', unread: true },
  { category: 'Security', icon: 'shield', title: 'Two-factor authentication enabled', body: 'Your workspace security settings were updated.', time: 'Yesterday', unread: false },
  { category: 'Reports', icon: 'chart', title: 'Your weekly report is ready', body: 'Workspace performance for Nov 18–24 is available.', time: 'Yesterday', unread: false },
]

export const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
export const formatNaira = (value) => `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value)}`
