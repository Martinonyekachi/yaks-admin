import { adminProfile } from './admin.js'

export const settingsModules = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'projects', label: 'Projects' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'reports', label: 'Reports' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
]

const permissionSet = (rules) => Object.fromEntries(settingsModules.map(({ id }) => [
  id,
  {
    view: Boolean(rules.view),
    create: Boolean(rules.create),
    edit: Boolean(rules.edit),
    delete: Boolean(rules.delete),
  },
]))

export const defaultAdminSettings = {
  general: {
    applicationName: 'Yaks Admin Panel',
    companyName: 'Northstar Studio',
    companyEmail: 'admin@northstar.studio',
    phone: '+234 803 555 0142',
    address: '14 Akin Adesola Street, Victoria Island, Lagos, Nigeria',
    website: 'https://northstar.studio',
    logoUrl: '',
    timeZone: 'Africa/Lagos',
    dateFormat: 'dd/MM/yyyy',
    currency: 'NGN',
  },
  profile: {
    name: adminProfile.name,
    email: adminProfile.email,
    phone: '+234 803 555 0142',
    jobTitle: 'Super Administrator',
    about: 'Building thoughtful experiences with the Northstar team.',
    avatarUrl: '',
  },
  roles: [
    { id: 'super-administrator', name: 'Super Administrator', description: 'Full access to every workspace module and administrative control.', protected: true, permissions: permissionSet({ view: true, create: true, edit: true, delete: true }) },
    { id: 'administrator', name: 'Administrator', description: 'Manages workspace operations, users, projects, and reporting.', protected: false, permissions: permissionSet({ view: true, create: true, edit: true, delete: true }) },
    { id: 'manager', name: 'Manager', description: 'Coordinates projects and teams with access to operational reporting.', protected: false, permissions: permissionSet({ view: true, create: true, edit: true }) },
    { id: 'editor', name: 'Editor', description: 'Creates and updates assigned workspace content.', protected: false, permissions: permissionSet({ view: true, create: true, edit: true }) },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access to approved workspace information.', protected: false, permissions: permissionSet({ view: true }) },
  ],
  appearance: {
    theme: 'dark',
    density: 'comfortable',
    sidebarCollapsed: false,
    reduceMotion: false,
  },
  notifications: {
    emailEnabled: true,
    inAppEnabled: true,
    transactions: true,
    userRegistrations: true,
    systemUpdates: true,
    securityAlerts: true,
  },
  security: {
    twoFactorEnabled: true,
    loginAlerts: true,
    autoLock: true,
  },
}

export const demoSessions = [
  { id: 'session-current', device: 'This device', browser: 'Chrome on Windows', location: 'Lagos, Nigeria', lastActive: 'Active now', current: true },
  { id: 'session-mobile', device: 'Mobile device', browser: 'Safari on iOS', location: 'Lagos, Nigeria', lastActive: '2 hours ago', current: false },
  { id: 'session-office', device: 'Office workstation', browser: 'Firefox on Windows', location: 'Abuja, Nigeria', lastActive: 'Yesterday at 16:42', current: false },
]

export const demoLoginActivity = [
  { id: 'login-1', event: 'Successful sign-in', browser: 'Chrome on Windows', location: 'Lagos, Nigeria', time: 'Today, 08:42 WAT', outcome: 'Success' },
  { id: 'login-2', event: 'Successful sign-in', browser: 'Safari on iOS', location: 'Lagos, Nigeria', time: 'Yesterday, 18:16 WAT', outcome: 'Success' },
  { id: 'login-3', event: 'Sign-in attempt blocked', browser: 'Unknown browser', location: 'Unrecognized location', time: '26 Nov 2026, 08:46 WAT', outcome: 'Blocked' },
]
