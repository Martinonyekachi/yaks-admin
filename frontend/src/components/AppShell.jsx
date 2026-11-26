import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, Bell, BriefcaseBusiness, ChartNoAxesCombined, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, CreditCard, LayoutDashboard, LogOut, Menu, Search, Settings, Users, X,
} from 'lucide-react'
import { Avatar } from './UI.jsx'
import { useToast } from './toast-context.js'
import { useNotifications } from './notifications-context.jsx'
import { useAdminSettings } from './settings-context.jsx'

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Analytics', path: '/analytics', icon: ChartNoAxesCombined },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Projects', path: '/projects', icon: BriefcaseBusiness },
  { label: 'Transactions', path: '/transactions', icon: CreditCard },
  { label: 'Reports', path: '/reports', icon: Activity },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
]
const pageNames = Object.fromEntries(navigation.map((item) => [item.path, item.label]))
const currentYear = new Date().getFullYear()
const notificationTime = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
const notificationIcons = { Transactions: CreditCard, Users, Projects: BriefcaseBusiness, 'System Updates': Settings, 'Security Alerts': Activity }

function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchInput = useRef(null)
  const notificationDropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const notify = useToast()
  const { profile, appearance, settings, saveSection } = useAdminSettings()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const collapsed = appearance.sidebarCollapsed
  const currentPage = pageNames[location.pathname] || 'Dashboard'
  const searchResults = navigation.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
  const latestNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const profileInitials = profile.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || 'YA'

  useEffect(() => {
    document.title = settings.general.applicationName || 'Yaks Admin Panel'
  }, [settings.general.applicationName])

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }
      if (event.key === 'Escape') setSearch('')
      if (event.key === 'Escape') setNotificationsOpen(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!notificationsOpen) return undefined
    function closeOnOutsideClick(event) {
      if (!notificationDropdownRef.current?.contains(event.target)) setNotificationsOpen(false)
    }
    window.addEventListener('pointerdown', closeOnOutsideClick)
    return () => window.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [notificationsOpen])

  function openNotification(notification) {
    markRead(notification.id)
    setNotificationsOpen(false)
    navigate(notification.related?.path || '/notifications')
  }

  function markAllNotificationsRead() {
    markAllRead()
    notify('All notifications marked as read')
  }

  function toggleSidebar() {
    try {
      saveSection('appearance', { ...settings.appearance, sidebarCollapsed: !collapsed })
    } catch (error) {
      console.error('Unable to save the sidebar preference.', error)
      notify('Could not save your sidebar preference locally')
    }
  }

  const navContent = (
    <>
      <div className="brand-row">
        <span className="brand-symbol">{settings.general.logoUrl ? <img src={settings.general.logoUrl} alt="" /> : <><span /><span /><span /></>}</span>
        <span className="brand-name">yaks<span className="brand-period">.</span></span>
        <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}><X size={18} /></button>
      </div>
      <div className="workspace-switcher">
        <span className="workspace-mark">{settings.general.companyName.charAt(0).toUpperCase() || 'N'}</span>
        <span className="workspace-copy"><strong>{settings.general.companyName}</strong><small>Pro workspace</small></span>
        <ChevronDown size={15} />
      </div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map(({ label, path, icon: Icon }) => {
          const count = path === '/notifications' && unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null
          return (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setDrawerOpen(false)} title={collapsed ? label : undefined}>
              <Icon size={18} strokeWidth={1.8} /><span className="nav-label">{label}</span>{count && <span className="nav-count">{count}</span>}
            </NavLink>
          )
        })}
      </nav>
      <div className="sidebar-bottom">
        <button className="help-card" onClick={() => notify('The help center is not connected yet')}>
          <span className="help-icon"><CircleHelp size={17} /></span>
          <div><strong>Need a hand?</strong><small>Visit our help center</small></div>
          <ChevronRight size={15} />
        </button>
        <button className="nav-link logout-link" onClick={() => notify(`You are signed in as ${profile.name}`)}><LogOut size={18} strokeWidth={1.8} /><span className="nav-label">Log out</span></button>
        <div className="sidebar-user"><Avatar initials={profileInitials} image={profile.avatarUrl} color="lavender" /><div className="user-copy"><strong>{profile.name}</strong><small>{profile.jobTitle || 'Workspace admin'}</small></div><ChevronDown size={15} /></div>
      </div>
    </>
  )

  return (
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      {drawerOpen && <button className="drawer-scrim" aria-label="Close navigation drawer" onClick={() => setDrawerOpen(false)} />}
      <aside className={`sidebar${drawerOpen ? ' drawer-open' : ''}`}>{navContent}</aside>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-leading">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}><Menu size={20} /></button>
            <button className="icon-button collapse-button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={toggleSidebar}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button>
            <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{currentPage}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="global-search">
              <button type="button" className="search-trigger" aria-label="Focus search" onClick={() => searchInput.current?.focus()}><Search size={16} /></button><input ref={searchInput} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && searchResults[0]) { navigate(searchResults[0].path); setSearch('') } }} placeholder="Search anything..." aria-label="Search navigation" />
              <kbd>⌘ K</kbd>
              {search && <div className="search-results">{searchResults.length ? searchResults.map((item) => <button key={item.path} onClick={() => { navigate(item.path); setSearch('') }}><item.icon size={16} />{item.label}<span>Go to</span></button>) : <p>No pages found</p>}</div>}
            </div>
            <div className="top-notifications-wrap" ref={notificationDropdownRef}>
              <button
                className="icon-button top-notifications"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={notificationsOpen}
                aria-haspopup="dialog"
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="top-notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notificationsOpen && <section className="notification-dropdown" role="dialog" aria-label="Recent notifications">
                <div className="notification-dropdown-header">
                  <div><strong>Notifications</strong><span>{unreadCount} unread</span></div>
                  {unreadCount > 0 && <button className="text-button" onClick={markAllNotificationsRead}>Mark all read</button>}
                </div>
                <div className="notification-dropdown-list">
                  {latestNotifications.map((item) => {
                    const Icon = notificationIcons[item.category] || Bell
                    return <article className={`notification-dropdown-row${item.read ? '' : ' is-unread'}`} key={item.id}>
                      <button className="notification-dropdown-open" onClick={() => openNotification(item)}>
                        <span className={`notification-item-icon notify-${item.category.toLowerCase().replace(/\s+/g, '-')}`}><Icon size={15} /></span>
                        <span className="notification-dropdown-copy"><strong>{item.title}</strong><small>{item.description}</small><time>{notificationTime.format(new Date(item.createdAt))}</time></span>
                        {!item.read && <i className="notification-dropdown-dot" />}
                      </button>
                      {!item.read && <button className="notification-dropdown-read" aria-label={`Mark ${item.title} as read`} onClick={() => markRead(item.id)}><Check size={14} /></button>}
                    </article>
                  })}
                  {!latestNotifications.length && <p className="notification-dropdown-empty">You’re all caught up.</p>}
                </div>
                <button className="notification-dropdown-footer" onClick={() => { setNotificationsOpen(false); navigate('/notifications') }}>View notification centre<ChevronRight size={14} /></button>
              </section>}
            </div>
            <span className="topbar-divider" />
            <div className="profile-wrap">
              <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
                <Avatar initials={profileInitials} image={profile.avatarUrl} color="lavender" /><span className="profile-text"><strong>{profile.name}</strong><small>{profile.jobTitle || 'Admin'}</small></span><ChevronDown size={15} />
              </button>
              {profileOpen && <div className="profile-menu"><strong>{profile.name}</strong><small>{profile.email}</small><button onClick={() => { navigate('/settings'); setProfileOpen(false) }}>Account settings</button><button onClick={() => { setProfileOpen(false); notify(`You are signed in as ${profile.name}`) }}>Log out</button></div>}
            </div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>© {currentYear} Yaks, Inc.</span><span>Made for teams that move forward <span className="footer-spark">✳</span></span></footer>
      </div>
    </div>
  )
}

export default AppShell
