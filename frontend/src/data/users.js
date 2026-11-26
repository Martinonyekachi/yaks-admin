function dateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const userRoles = ['Super Admin', 'Administrator', 'Manager', 'Editor', 'Customer']
export const userStatuses = ['Active', 'Inactive', 'Suspended']

export const initialUserRecords = [
  { id: 'YKS-01024', name: 'Olivia Rhye', email: 'olivia.rhye@yaks.ng', phone: '+234 803 555 0142', role: 'Super Admin', status: 'Active', registeredAt: dateDaysAgo(1), initials: 'OR', color: 'peach', activity: [{ title: 'Signed in', detail: 'Successful sign-in from Lagos, Nigeria', daysAgo: 0 }, { title: 'Profile updated', detail: 'Updated account security settings', daysAgo: 2 }] },
  { id: 'YKS-01025', name: 'Phoenix Baker', email: 'phoenix.baker@yaks.ng', phone: '+234 806 441 2081', role: 'Administrator', status: 'Active', registeredAt: dateDaysAgo(4), initials: 'PB', color: 'purple', activity: [{ title: 'Invited a teammate', detail: 'Added a new member to the workspace', daysAgo: 1 }] },
  { id: 'YKS-01026', name: 'Lana Steiner', email: 'lana.steiner@yaks.ng', phone: '+234 809 772 6304', role: 'Manager', status: 'Active', registeredAt: dateDaysAgo(7), initials: 'LS', color: 'mint', activity: [{ title: 'Project access updated', detail: 'Granted access to the Brand Refresh project', daysAgo: 2 }] },
  { id: 'YKS-01027', name: 'Demi Wilkinson', email: 'demi.wilkinson@yaks.ng', phone: '+234 701 338 9210', role: 'Editor', status: 'Active', registeredAt: dateDaysAgo(10), initials: 'DW', color: 'blue', activity: [{ title: 'Profile created', detail: 'Completed account registration', daysAgo: 10 }] },
  { id: 'YKS-01028', name: 'Candice Wu', email: 'candice.wu@yaks.ng', phone: '+234 802 019 4428', role: 'Customer', status: 'Active', registeredAt: dateDaysAgo(15), initials: 'CW', color: 'gold', activity: [{ title: 'Subscription renewed', detail: 'Workspace plan renewed successfully', daysAgo: 3 }] },
  { id: 'YKS-01029', name: 'Natali Craig', email: 'natali.craig@yaks.ng', phone: '+234 805 617 9203', role: 'Customer', status: 'Inactive', registeredAt: dateDaysAgo(23), initials: 'NC', color: 'pink', activity: [{ title: 'Account deactivated', detail: 'Access paused by an administrator', daysAgo: 4 }] },
  { id: 'YKS-01030', name: 'Drew Cano', email: 'drew.cano@yaks.ng', phone: '+234 810 882 4176', role: 'Manager', status: 'Active', registeredAt: dateDaysAgo(29), initials: 'DC', color: 'green', activity: [{ title: 'User role updated', detail: 'Promoted to Manager', daysAgo: 5 }] },
  { id: 'YKS-01031', name: 'Andi Lane', email: 'andi.lane@yaks.ng', phone: '+234 703 226 8491', role: 'Editor', status: 'Suspended', registeredAt: dateDaysAgo(32), initials: 'AL', color: 'lavender', activity: [{ title: 'Account suspended', detail: 'Sign-in access restricted pending review', daysAgo: 3 }] },
  { id: 'YKS-01032', name: 'Kate Morrison', email: 'kate.morrison@yaks.ng', phone: '+234 807 640 1259', role: 'Customer', status: 'Active', registeredAt: dateDaysAgo(45), initials: 'KM', color: 'rose', activity: [{ title: 'Signed in', detail: 'Successful sign-in from Abuja, Nigeria', daysAgo: 1 }] },
  { id: 'YKS-01033', name: 'John Smith', email: 'john.smith@yaks.ng', phone: '+234 814 301 6572', role: 'Administrator', status: 'Active', registeredAt: dateDaysAgo(58), initials: 'JS', color: 'slate', activity: [{ title: 'Permission settings changed', detail: 'Reviewed administrator permissions', daysAgo: 6 }] },
  { id: 'YKS-01034', name: 'Amina Yusuf', email: 'amina.yusuf@yaks.ng', phone: '+234 803 915 6270', role: 'Customer', status: 'Inactive', registeredAt: dateDaysAgo(75), initials: 'AY', color: 'peach', activity: [{ title: 'Account deactivated', detail: 'Access paused at the user’s request', daysAgo: 8 }] },
  { id: 'YKS-01035', name: 'Chidi Okafor', email: 'chidi.okafor@yaks.ng', phone: '+234 706 448 9012', role: 'Manager', status: 'Active', registeredAt: dateDaysAgo(92), initials: 'CO', color: 'mint', activity: [{ title: 'Project assigned', detail: 'Added to the Q4 Growth Campaign', daysAgo: 2 }] },
  { id: 'YKS-01036', name: 'Zainab Bello', email: 'zainab.bello@yaks.ng', phone: '+234 809 553 7204', role: 'Editor', status: 'Active', registeredAt: dateDaysAgo(110), initials: 'ZB', color: 'purple', activity: [{ title: 'Content published', detail: 'Published a workspace update', daysAgo: 4 }] },
  { id: 'YKS-01037', name: 'Tunde Adeyemi', email: 'tunde.adeyemi@yaks.ng', phone: '+234 812 667 0348', role: 'Customer', status: 'Suspended', registeredAt: dateDaysAgo(135), initials: 'TA', color: 'gold', activity: [{ title: 'Account suspended', detail: 'Sign-in access restricted by an administrator', daysAgo: 12 }] },
  { id: 'YKS-01038', name: 'Amara Nwosu', email: 'amara.nwosu@yaks.ng', phone: '+234 701 294 8831', role: 'Customer', status: 'Active', registeredAt: dateDaysAgo(160), initials: 'AN', color: 'pink', activity: [{ title: 'Signed in', detail: 'Successful sign-in from Enugu, Nigeria', daysAgo: 3 }] },
  { id: 'YKS-01039', name: 'Emeka Eze', email: 'emeka.eze@yaks.ng', phone: '+234 805 748 1906', role: 'Manager', status: 'Inactive', registeredAt: dateDaysAgo(185), initials: 'EE', color: 'slate', activity: [{ title: 'Account deactivated', detail: 'Access paused by an administrator', daysAgo: 14 }] },
  { id: 'YKS-01040', name: 'Bisi Adebayo', email: 'bisi.adebayo@yaks.ng', phone: '+234 813 002 7491', role: 'Customer', status: 'Suspended', registeredAt: dateDaysAgo(210), initials: 'BA', color: 'rose', activity: [{ title: 'Account suspended', detail: 'Sign-in access restricted pending review', daysAgo: 9 }] },
  { id: 'YKS-01041', name: 'Seyi Lawal', email: 'seyi.lawal@yaks.ng', phone: '+234 802 777 3104', role: 'Customer', status: 'Active', registeredAt: dateDaysAgo(270), initials: 'SL', color: 'green', activity: [{ title: 'Profile updated', detail: 'Changed contact information', daysAgo: 5 }] },
  { id: 'YKS-01042', name: 'Nneka Obi', email: 'nneka.obi@yaks.ng', phone: '+234 706 489 3518', role: 'Editor', status: 'Inactive', registeredAt: dateDaysAgo(340), initials: 'NO', color: 'lavender', activity: [{ title: 'Account deactivated', detail: 'Access paused by an administrator', daysAgo: 21 }] },
]
