import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, Bell, Check, CheckCheck, Clock3, CreditCard, Eye, Filter, FolderKanban,
  Search, ShieldCheck, Trash2, UserRound, X,
} from 'lucide-react'
import { activityLog } from '../data/activity.js'
import { notificationCategories, notificationPriorities } from '../data/notifications.js'
import { EmptyState, Modal, PageHeading, PanelHeading } from '../components/UI.jsx'
import { useToast } from '../components/toast-context.js'
import { useNotifications } from '../components/notifications-context.jsx'

function FilterSelect({ value, onChange, options, label }) {
  return <label className="select-wrap"><Filter size={14} /><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

export function NotificationsPage() {
  const { notifications, unreadCount, markRead, markUnread, markAllRead, deleteNotification, clearRead } = useNotifications()
  const [view, setView] = useState('Notifications')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Notifications')
  const [readStatus, setReadStatus] = useState('All statuses')
  const [priority, setPriority] = useState('All priorities')
  const [sort, setSort] = useState('Newest first')
  const [activityCategory, setActivityCategory] = useState('All categories')
  const [activitySort, setActivitySort] = useState('Newest first')
  const [activitySearch, setActivitySearch] = useState('')
  const [page, setPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [confirmAction, setConfirmAction] = useState(null)
  const notify = useToast()
  const navigate = useNavigate()
  const readCount = notifications.length - unreadCount
  const importantCount = notifications.filter((item) => ['Critical', 'High'].includes(item.priority)).length
  const categoryIcons = { Transactions: CreditCard, Users: UserRound, Projects: FolderKanban, 'System Updates': Bell, 'Security Alerts': ShieldCheck }
  const categories = ['All Notifications', ...notificationCategories]
  const activityCategories = ['All categories', ...notificationCategories]
  const filteredNotifications = useMemo(() => notifications.filter((item) => {
    const query = search.trim().toLowerCase()
    return (!query || `${item.title} ${item.description}`.toLowerCase().includes(query))
      && (category === 'All Notifications' || item.category === category)
      && (readStatus === 'All statuses' || (readStatus === 'Unread' ? !item.read : item.read))
      && (priority === 'All priorities' || item.priority === priority)
  }).sort((a, b) => sort === 'Newest first' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)), [category, notifications, priority, readStatus, search, sort])
  const pageCount = Math.max(1, Math.ceil(filteredNotifications.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleNotifications = filteredNotifications.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const filteredActivity = useMemo(() => activityLog.filter((item) => {
    const query = activitySearch.trim().toLowerCase()
    return (!query || `${item.description} ${item.actor} ${item.category} ${item.record}`.toLowerCase().includes(query))
      && (activityCategory === 'All categories' || item.category === activityCategory)
  }).sort((a, b) => activitySort === 'Newest first' ? new Date(b.happenedAt) - new Date(a.happenedAt) : new Date(a.happenedAt) - new Date(b.happenedAt)), [activityCategory, activitySearch, activitySort])
  const activityPageCount = Math.max(1, Math.ceil(filteredActivity.length / pageSize))
  const currentActivityPage = Math.min(activityPage, activityPageCount)
  const visibleActivity = filteredActivity.slice((currentActivityPage - 1) * pageSize, currentActivityPage * pageSize)
  const updateNotificationFilter = (setter, value) => { setter(value); setPage(1) }
  const updateActivityFilter = (setter, value) => { setter(value); setActivityPage(1) }
  const updatePageSize = (value) => { setPageSize(Number(value)); setPage(1); setActivityPage(1) }

  function openNotification(item) {
    markRead(item.id)
    if (item.related?.path) navigate(item.related.path)
    else notify('Notification marked as read')
  }

  function confirm() {
    if (confirmAction?.type === 'delete') {
      deleteNotification(confirmAction.id)
      notify('Notification deleted')
    } else if (confirmAction?.type === 'clear-read') {
      clearRead()
      notify('Read notifications cleared')
    }
    setConfirmAction(null)
  }

  return <div className="workspace-page">
    <PageHeading eyebrow="WORKSPACE" title="Notifications & Activity" description="Review workspace updates and keep track of important administrative actions." actions={<><button className="button button-secondary" disabled={!unreadCount} onClick={() => { markAllRead(); notify('All notifications marked as read') }}><CheckCheck size={15} />Mark all read</button><button className="button button-secondary" disabled={!readCount} onClick={() => setConfirmAction({ type: 'clear-read' })}><Trash2 size={15} />Clear read</button></>} />
    <div className="notification-page-tabs" role="tablist" aria-label="Notification views">
      {['Notifications', 'Activity log'].map((value) => <button key={value} role="tab" aria-selected={view === value} className={view === value ? 'selected' : ''} onClick={() => setView(value)}>{value}{value === 'Notifications' && unreadCount > 0 && <span>{unreadCount}</span>}</button>)}
    </div>
    {view === 'Notifications' ? <>
      <div className="notification-stat-grid">
        <div className="notification-stat"><span className="notification-stat-icon blue"><Bell size={17} /></span><div><small>Total notifications</small><strong>{notifications.length}</strong></div></div>
        <div className="notification-stat"><span className="notification-stat-icon amber"><Clock3 size={17} /></span><div><small>Unread</small><strong>{unreadCount}</strong></div></div>
        <div className="notification-stat"><span className="notification-stat-icon green"><Check size={17} /></span><div><small>Read</small><strong>{readCount}</strong></div></div>
        <div className="notification-stat"><span className="notification-stat-icon red"><ShieldCheck size={17} /></span><div><small>Important</small><strong>{importantCount}</strong></div></div>
      </div>
      <section className="panel notification-center-panel">
        <div className="notification-controls">
          <label className="notification-search"><Search size={15} /><input value={search} onChange={(event) => updateNotificationFilter(setSearch, event.target.value)} placeholder="Search notifications..." aria-label="Search notifications" />{search && <button aria-label="Clear search" onClick={() => updateNotificationFilter(setSearch, '')}><X size={14} /></button>}</label>
          <FilterSelect value={category} onChange={(value) => updateNotificationFilter(setCategory, value)} label="Filter notification category" options={categories} />
          <FilterSelect value={readStatus} onChange={(value) => updateNotificationFilter(setReadStatus, value)} label="Filter read status" options={['All statuses', 'Unread', 'Read']} />
          <FilterSelect value={priority} onChange={(value) => updateNotificationFilter(setPriority, value)} label="Filter notification priority" options={['All priorities', ...notificationPriorities]} />
          <FilterSelect value={sort} onChange={(value) => updateNotificationFilter(setSort, value)} label="Sort notifications" options={['Newest first', 'Oldest first']} />
        </div>
        <div className="notification-results-label">{filteredNotifications.length} notification{filteredNotifications.length === 1 ? '' : 's'}</div>
        <div className="notification-center-list">
          {visibleNotifications.map((item) => {
            const Icon = categoryIcons[item.category] || Bell
            return <article className={`notification-center-item${item.read ? '' : ' is-unread'}`} key={item.id}>
              <span className={`notification-item-icon notify-${item.category.toLowerCase().replace(/\s+/g, '-')}`}><Icon size={17} /></span>
              <button className="notification-center-copy" onClick={() => openNotification(item)}>
                <span className="notification-center-title">{item.title}<span className={`priority-badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span>{!item.read && <i className="notification-center-unread-dot" />}</span>
                <span className="notification-center-description">{item.description}</span>
                <span className="notification-center-meta"><span>{item.category}</span><b>·</b><time>{new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</time>{item.related?.record && <><b>·</b><span>{item.related.record}</span></>}</span>
              </button>
              <div className="notification-center-actions">
                <span className={`read-state${item.read ? '' : ' unread'}`}>{item.read ? 'Read' : 'Unread'}</span>
                <button className="icon-button" aria-label={item.read ? `Mark ${item.title} as unread` : `Mark ${item.title} as read`} title={item.read ? 'Mark unread' : 'Mark read'} onClick={() => item.read ? markUnread(item.id) : markRead(item.id)}>{item.read ? <Eye size={15} /> : <Check size={15} />}</button>
                {item.related?.path && <button className="icon-button notification-open-link" aria-label={`Open ${item.related.label}`} title={`Open ${item.related.label}`} onClick={() => openNotification(item)}><FolderKanban size={15} /></button>}
                <button className="icon-button danger-icon" aria-label={`Delete ${item.title}`} title="Delete notification" onClick={() => setConfirmAction({ type: 'delete', id: item.id, title: item.title })}><Trash2 size={15} /></button>
              </div>
            </article>
          })}
          {!visibleNotifications.length && <EmptyState title="No notifications found" description="Try changing your search or filters to find what you’re looking for." />}
        </div>
        <div className="notification-pagination">
          <span>Showing {filteredNotifications.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredNotifications.length)} of {filteredNotifications.length}</span>
          <label>Rows <select aria-label="Notification page size" value={pageSize} onChange={(event) => updatePageSize(event.target.value)}><option value={8}>8</option><option value={12}>12</option><option value={24}>24</option></select></label>
          <div><button className="button button-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pageCount}</span><button className="button button-secondary" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></div>
        </div>
      </section>
    </> : <section className="panel activity-log-panel">
      <PanelHeading title="Administrative activity" subtitle="A local record of recent changes across your workspace." />
      <div className="notification-controls activity-controls">
        <label className="notification-search"><Search size={15} /><input value={activitySearch} onChange={(event) => updateActivityFilter(setActivitySearch, event.target.value)} placeholder="Search activity..." aria-label="Search activity log" />{activitySearch && <button aria-label="Clear search" onClick={() => updateActivityFilter(setActivitySearch, '')}><X size={14} /></button>}</label>
        <FilterSelect value={activityCategory} onChange={(value) => updateActivityFilter(setActivityCategory, value)} label="Filter activity category" options={activityCategories} />
        <FilterSelect value={activitySort} onChange={(value) => updateActivityFilter(setActivitySort, value)} label="Sort activity log" options={['Newest first', 'Oldest first']} />
      </div>
      <div className="activity-log-list">
        {visibleActivity.map((item) => {
          const Icon = categoryIcons[item.category] || Activity
          return <article className="activity-log-row" key={item.id}>
            <span className={`notification-item-icon notify-${item.category.toLowerCase().replace(/\s+/g, '-')}`}><Icon size={16} /></span>
            <div className="activity-log-copy"><strong>{item.description}</strong><span><b>{item.actor}</b> · {item.category}</span><small>{item.record}</small></div>
            <time>{new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.happenedAt))}</time>
            <button className="icon-button" aria-label={`Open ${item.record}`} title={`Open ${item.record}`} onClick={() => navigate(item.path)}><FolderKanban size={15} /></button>
          </article>
        })}
        {!visibleActivity.length && <EmptyState title="No activity found" description="Try another search or category filter." />}
      </div>
      <div className="notification-pagination">
        <span>Showing {filteredActivity.length ? (currentActivityPage - 1) * pageSize + 1 : 0}–{Math.min(currentActivityPage * pageSize, filteredActivity.length)} of {filteredActivity.length}</span>
        <label>Rows <select aria-label="Activity page size" value={pageSize} onChange={(event) => updatePageSize(event.target.value)}><option value={8}>8</option><option value={12}>12</option><option value={24}>24</option></select></label>
        <div><button className="button button-secondary" disabled={currentActivityPage <= 1} onClick={() => setActivityPage(currentActivityPage - 1)}>Previous</button><span>Page {currentActivityPage} of {activityPageCount}</span><button className="button button-secondary" disabled={currentActivityPage >= activityPageCount} onClick={() => setActivityPage(currentActivityPage + 1)}>Next</button></div>
      </div>
    </section>}
    {confirmAction && <Modal title={confirmAction.type === 'delete' ? 'Delete notification?' : 'Clear read notifications?'} description={confirmAction.type === 'delete' ? 'This notification will be permanently removed from this local sample workspace.' : `This will remove ${readCount} read notifications from this local sample workspace.`} onClose={() => setConfirmAction(null)} footer={<><button className="button button-secondary" onClick={() => setConfirmAction(null)}>Cancel</button><button className="button button-danger" onClick={confirm}>{confirmAction.type === 'delete' ? 'Delete notification' : 'Clear read notifications'}</button></>}>
      <p className="confirm-copy">{confirmAction.type === 'delete' ? confirmAction.title : 'Unread notifications will be kept.'}</p>
    </Modal>}
  </div>
}

