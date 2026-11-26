import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownUp, ArrowUpDown, CalendarDays, Check, ChevronLeft, ChevronRight, Download,
  Edit3, Eye, Filter, Mail, Phone, Plus, Search, Trash2, UserCheck, UserMinus,
  UserPlus, Users, X,
} from 'lucide-react'
import { Avatar, EmptyState, Modal, PageHeading, StatusBadge } from '../components/UI.jsx'
import { useToast } from '../components/toast-context.js'
import { initialUserRecords, userRoles, userStatuses } from '../data/users.js'
import { downloadCSV } from '../utils/csv.js'

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
const activityFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function toLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatRegistrationDate(value) {
  return dateFormatter.format(new Date(`${value}T12:00:00`))
}

function createInitials(name) {
  return name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function UserStat({ label, value, note, icon: Icon, tone }) {
  return (
    <article className="panel user-stat">
      <div className="user-stat-heading">
        <span className="metric-label">{label}</span>
        <span className={`metric-icon metric-${tone}`}><Icon size={17} /></span>
      </div>
      <strong className="user-stat-value">{value.toLocaleString()}</strong>
      <span className="user-stat-note">{note}</span>
    </article>
  )
}

function SortButton({ label, active, direction, onClick }) {
  const SortIcon = active && direction === 'asc' ? ArrowDownUp : ArrowUpDown
  return <button className="sort-heading" onClick={onClick}>{label}<SortIcon size={12} /></button>
}

function UserForm({ values, errors, onChange, onSubmit, editing }) {
  return (
    <form id="user-form" className="form-stack user-form" noValidate onSubmit={onSubmit}>
      <div className="user-form-grid">
        <label>Full name
          <input name="name" autoComplete="name" value={values.name} onChange={onChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'user-name-error' : undefined} placeholder="e.g. Taylor Morgan" />
          {errors.name && <small className="field-error" id="user-name-error">{errors.name}</small>}
        </label>
        <label>Email address
          <input name="email" type="email" autoComplete="email" value={values.email} onChange={onChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'user-email-error' : undefined} placeholder="name@company.com" />
          {errors.email && <small className="field-error" id="user-email-error">{errors.email}</small>}
        </label>
        <label>Phone number
          <input name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={onChange} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'user-phone-error' : undefined} placeholder="+234 801 234 5678" />
          {errors.phone && <small className="field-error" id="user-phone-error">{errors.phone}</small>}
        </label>
        <label>Role
          <select name="role" value={values.role} onChange={onChange}>{userRoles.map((role) => <option key={role}>{role}</option>)}</select>
        </label>
        <label>Account status
          <select name="status" value={values.status} onChange={onChange}>{userStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        </label>
      </div>
      <p className="user-form-note">{editing ? 'Changes apply to this local sample record.' : 'This creates a local sample record; no invitation is sent.'}</p>
    </form>
  )
}

function UserProfile({ user, today }) {
  return (
    <div className="user-profile">
      <div className="user-profile-heading">
        <Avatar initials={user.initials} color={user.color} size="large" />
        <div><h3>{user.name}</h3><span>{user.id}</span></div>
        <StatusBadge>{user.status}</StatusBadge>
      </div>
      <div className="user-profile-fields">
        <div><span><Mail size={14} />Email address</span><strong>{user.email}</strong></div>
        <div><span><Phone size={14} />Phone number</span><strong>{user.phone}</strong></div>
        <div><span>Role</span><strong>{user.role}</strong></div>
        <div><span>Registration date</span><strong>{formatRegistrationDate(user.registeredAt)}</strong></div>
      </div>
      <section className="user-activity">
        <h3>Recent account activity</h3>
        {user.activity?.length ? <ul>{user.activity.map((item, index) => {
          const date = new Date(today)
          date.setDate(date.getDate() - item.daysAgo)
          return <li key={`${item.title}-${index}`}><span className="user-activity-marker"><Check size={12} /></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{activityFormatter.format(date)}</time></li>
        })}</ul> : <p>No recent activity is recorded for this sample user.</p>}
      </section>
    </div>
  )
}

export default function UsersPage() {
  const [rows, setRows] = useState(initialUserRecords)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All roles')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [dateFilter, setDateFilter] = useState('All time')
  const [sortField, setSortField] = useState('registeredAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [modal, setModal] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [deleteIds, setDeleteIds] = useState([])
  const [formValues, setFormValues] = useState({ name: '', email: '', phone: '', role: 'Customer', status: 'Active' })
  const [formErrors, setFormErrors] = useState({})
  const [today] = useState(() => new Date())
  const selectAllRef = useRef(null)
  const notify = useToast()
  const selectedUser = rows.find((user) => user.id === selectedUserId) ?? null

  const dateCutoff = useMemo(() => {
    if (dateFilter === 'All time') return ''
    const cutoff = new Date(today)
    if (dateFilter === 'This year') cutoff.setMonth(0, 1)
    else cutoff.setDate(cutoff.getDate() - Number.parseInt(dateFilter.match(/\d+/)[0], 10))
    return toLocalDateString(cutoff)
  }, [dateFilter, today])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((user) => (
      (!query || `${user.name} ${user.email}`.toLowerCase().includes(query))
      && (roleFilter === 'All roles' || user.role === roleFilter)
      && (statusFilter === 'All statuses' || user.status === statusFilter)
      && (!dateCutoff || user.registeredAt >= dateCutoff)
    )).sort((a, b) => {
      const comparison = sortField === 'name'
        ? a.name.localeCompare(b.name)
        : a.registeredAt.localeCompare(b.registeredAt)
      return comparison * (sortDirection === 'asc' ? 1 : -1)
    })
  }, [dateCutoff, roleFilter, rows, search, sortDirection, sortField, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((user) => selectedIds.has(user.id))
  const someVisibleSelected = visibleRows.some((user) => selectedIds.has(user.id))
  const selectedCount = selectedIds.size
  const last30Days = new Date(today)
  last30Days.setDate(last30Days.getDate() - 30)
  const newRegistrationCutoff = toLocalDateString(last30Days)
  const newRegistrations = rows.filter((user) => user.registeredAt >= newRegistrationCutoff).length

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected && !allVisibleSelected
    }
  }, [allVisibleSelected, selectedIds, someVisibleSelected])

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  function changeSort(field) {
    if (sortField === field) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'name' ? 'asc' : 'desc')
    }
  }

  function toggleSelection(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allVisibleSelected) visibleRows.forEach((user) => next.delete(user.id))
      else visibleRows.forEach((user) => next.add(user.id))
      return next
    })
  }

  function openAddModal() {
    setSelectedUserId(null)
    setFormValues({ name: '', email: '', phone: '', role: 'Customer', status: 'Active' })
    setFormErrors({})
    setModal('form')
  }

  function openEditModal(user) {
    setSelectedUserId(user.id)
    setFormValues({ name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status })
    setFormErrors({})
    setModal('form')
  }

  function updateForm(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: '' }))
  }

  function submitUser(event) {
    event.preventDefault()
    const errors = {}
    const cleanName = formValues.name.trim()
    const cleanEmail = formValues.email.trim().toLowerCase()
    const cleanPhone = formValues.phone.trim()
    const digits = cleanPhone.replace(/\D/g, '')
    if (cleanName.length < 2) errors.name = 'Enter a full name with at least 2 characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errors.email = 'Enter a valid email address.'
    if (rows.some((user) => user.email.toLowerCase() === cleanEmail && user.id !== selectedUserId)) errors.email = 'A user with this email address already exists.'
    if (digits.length < 7 || digits.length > 15) errors.phone = 'Enter a phone number with 7 to 15 digits.'
    if (!userRoles.includes(formValues.role)) errors.role = 'Select a valid role.'
    if (!userStatuses.includes(formValues.status)) errors.status = 'Select a valid account status.'
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    if (selectedUserId) {
      setRows((current) => current.map((user) => user.id === selectedUserId
        ? { ...user, name: cleanName, email: cleanEmail, phone: cleanPhone, role: formValues.role, status: formValues.status, initials: createInitials(cleanName), activity: [{ title: 'Account details updated', detail: 'Profile, role or status changed by an administrator', daysAgo: 0 }, ...user.activity] }
        : user))
      notify(`${cleanName} updated`)
    } else {
      setRows((current) => {
        const nextNumber = Math.max(...current.map((user) => Number(user.id.split('-')[1]))) + 1
        const colors = ['peach', 'purple', 'mint', 'blue', 'gold', 'pink', 'green', 'lavender', 'rose', 'slate']
        const newUser = {
          id: `YKS-${String(nextNumber).padStart(5, '0')}`,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: formValues.role,
          status: formValues.status,
          registeredAt: toLocalDateString(new Date()),
          initials: createInitials(cleanName),
          color: colors[nextNumber % colors.length],
          activity: [{ title: 'Profile created', detail: 'User added by an administrator', daysAgo: 0 }],
        }
        return [newUser, ...current]
      })
      setPage(1)
      notify(`${cleanName} added to users`)
    }
    setSearch('')
    setRoleFilter('All roles')
    setStatusFilter('All statuses')
    setDateFilter('All time')
    setSelectedIds(new Set())
    setModal('')
  }

  function setUserStatus(user, status) {
    setRows((current) => current.map((item) => item.id === user.id
      ? { ...item, status, activity: [{ title: `Account ${status.toLowerCase()}`, detail: `Status changed by an administrator`, daysAgo: 0 }, ...item.activity] }
      : item))
    notify(`${user.name} is now ${status.toLowerCase()}`)
  }

  function setBulkStatus(status) {
    setRows((current) => current.map((user) => selectedIds.has(user.id)
      ? { ...user, status, activity: [{ title: `Account ${status.toLowerCase()}`, detail: 'Status changed by an administrator', daysAgo: 0 }, ...user.activity] }
      : user))
    notify(`${selectedCount} user${selectedCount === 1 ? '' : 's'} set to ${status.toLowerCase()}`)
    setSelectedIds(new Set())
  }

  function confirmDelete() {
    const count = deleteIds.length
    setRows((current) => current.filter((user) => !deleteIds.includes(user.id)))
    setSelectedIds((current) => new Set([...current].filter((id) => !deleteIds.includes(id))))
    setDeleteIds([])
    setModal('')
    notify(`${count} user${count === 1 ? '' : 's'} deleted from the local directory`)
  }

  function exportUsers() {
    const exportRows = [
      ['User ID', 'Full name', 'Email address', 'Phone number', 'Role', 'Registration date', 'Account status'],
      ...filteredRows.map((user) => [user.id, user.name, user.email, user.phone, user.role, formatRegistrationDate(user.registeredAt), user.status]),
    ]
    downloadCSV('yaks-users.csv', exportRows)
    notify(`${filteredRows.length} filtered user${filteredRows.length === 1 ? '' : 's'} exported`)
  }

  const sortNameActive = sortField === 'name'
  const sortDateActive = sortField === 'registeredAt'

  return (
    <div className="workspace-page users-page">
      <PageHeading
        eyebrow="WORKSPACE"
        title="User Management"
        description="Manage, monitor and organize platform users."
        actions={<><button className="button button-secondary" onClick={exportUsers}><Download size={15} />Export users</button><button className="button button-primary" onClick={openAddModal}><Plus size={16} />Add new user</button></>}
      />

      <section className="user-stats" aria-label="User statistics">
        <UserStat label="Total users" value={rows.length} note="Across all account roles" icon={Users} tone="blue" />
        <UserStat label="Active users" value={rows.filter((user) => user.status === 'Active').length} note="Accounts with active access" icon={UserCheck} tone="green" />
        <UserStat label="Inactive users" value={rows.filter((user) => user.status === 'Inactive').length} note="Accounts marked inactive" icon={UserMinus} tone="amber" />
        <UserStat label="New registrations" value={newRegistrations} note="Registered in the last 30 days" icon={UserPlus} tone="violet" />
      </section>

      <section className="panel table-panel user-directory">
        <div className="panel-heading user-directory-heading">
          <div><h2>User directory</h2><p>Sample workspace data · Changes are local to this session</p></div>
          <span className="user-result-count">{filteredRows.length.toLocaleString()} {filteredRows.length === 1 ? 'user' : 'users'}</span>
        </div>
        <div className="user-filter-bar">
          <label className="table-search user-search"><Search size={16} /><input aria-label="Search users by name or email" placeholder="Search name or email..." value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} /></label>
          <div className="user-filter-controls">
            <label className="select-wrap"><Users size={14} /><select aria-label="Filter users by role" value={roleFilter} onChange={(event) => updateFilter(setRoleFilter, event.target.value)}><option>All roles</option>{userRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
            <label className="select-wrap"><Filter size={14} /><select aria-label="Filter users by status" value={statusFilter} onChange={(event) => updateFilter(setStatusFilter, event.target.value)}><option>All statuses</option>{userStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="select-wrap"><CalendarDays size={14} /><select aria-label="Filter users by registration date" value={dateFilter} onChange={(event) => updateFilter(setDateFilter, event.target.value)}><option>All time</option><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select></label>
          </div>
        </div>

        {selectedCount > 0 && <div className="user-bulk-bar" role="region" aria-label="Bulk user actions">
          <span><strong>{selectedCount}</strong> selected</span>
          <div>
            <button className="button button-quiet" onClick={() => setBulkStatus('Active')}><UserCheck size={14} />Activate</button>
            <button className="button button-quiet" onClick={() => setBulkStatus('Inactive')}><UserMinus size={14} />Deactivate</button>
            <button className="button button-quiet user-delete-action" onClick={() => { setDeleteIds([...selectedIds]); setModal('delete') }}><Trash2 size={14} />Delete</button>
            <button className="icon-button" aria-label="Clear selected users" onClick={() => setSelectedIds(new Set())}><X size={15} /></button>
          </div>
        </div>}

        <div className="table-scroll">
          <table className="data-table users-table">
            <thead><tr>
              <th className="user-checkbox-cell"><input ref={selectAllRef} type="checkbox" aria-label="Select users on this page" checked={allVisibleSelected} onChange={toggleVisibleSelection} /></th>
              <th>USER ID</th>
              <th>AVATAR</th>
              <th aria-sort={sortNameActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}><SortButton label="FULL NAME" active={sortNameActive} direction={sortDirection} onClick={() => changeSort('name')} /></th>
              <th>EMAIL ADDRESS</th>
              <th>ROLE</th>
              <th aria-sort={sortDateActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}><SortButton label="REGISTRATION DATE" active={sortDateActive} direction={sortDirection} onClick={() => changeSort('registeredAt')} /></th>
              <th>ACCOUNT STATUS</th>
              <th>ACTIONS</th>
            </tr></thead>
            <tbody>
              {visibleRows.map((user) => <tr key={user.id}>
                <td className="user-checkbox-cell"><input type="checkbox" aria-label={`Select ${user.name}`} checked={selectedIds.has(user.id)} onChange={() => toggleSelection(user.id)} /></td>
                <td className="user-id-cell">{user.id}</td>
                <td><Avatar initials={user.initials} color={user.color} size="small" /></td>
                <td className="user-name-cell"><strong>{user.name}</strong></td>
                <td className="user-email-cell">{user.email}</td>
                <td>{user.role}</td>
                <td>{formatRegistrationDate(user.registeredAt)}</td>
                <td><StatusBadge>{user.status}</StatusBadge></td>
                <td><div className="user-row-actions">
                  <button className="icon-button" aria-label={`View ${user.name} profile`} title="View profile" onClick={() => { setSelectedUserId(user.id); setModal('details') }}><Eye size={15} /></button>
                  <button className="icon-button" aria-label={`Edit ${user.name}`} title="Edit user" onClick={() => openEditModal(user)}><Edit3 size={15} /></button>
                  <button className="icon-button" aria-label={`${user.status === 'Active' ? 'Deactivate' : 'Activate'} ${user.name}`} title={user.status === 'Active' ? 'Deactivate account' : 'Activate account'} onClick={() => setUserStatus(user, user.status === 'Active' ? 'Inactive' : 'Active')}>{user.status === 'Active' ? <UserMinus size={15} /> : <UserCheck size={15} />}</button>
                  <button className="icon-button user-delete-action" aria-label={`Delete ${user.name}`} title="Delete user" onClick={() => { setDeleteIds([user.id]); setModal('delete') }}><Trash2 size={15} /></button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
          {!visibleRows.length && <EmptyState title="No users found" description="Try adjusting your search or filters." />}
        </div>
        <div className="user-pagination">
          <label>Rows per page<select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option></select></label>
          <span>Showing <strong>{filteredRows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredRows.length)}</strong> of <strong>{filteredRows.length}</strong></span>
          <div className="pagination-buttons">
            <button className="icon-button" disabled={currentPage === 1} aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={17} /></button>
            <span>Page {currentPage} of {pageCount}</span>
            <button className="icon-button" disabled={currentPage === pageCount} aria-label="Next page" onClick={() => setPage((current) => current + 1)}><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>

      {modal === 'form' && <Modal
        title={selectedUserId ? 'Edit user' : 'Add new user'}
        description={selectedUserId ? 'Update profile details, access role and account status.' : 'Add a user profile to the local workspace directory.'}
        onClose={() => setModal('')}
        footer={<><button className="button button-secondary" onClick={() => setModal('')}>Cancel</button><button className="button button-primary" type="submit" form="user-form">{selectedUserId ? <Check size={15} /> : <Plus size={15} />}{selectedUserId ? 'Save changes' : 'Add user'}</button></>}
      ><UserForm values={formValues} errors={formErrors} onChange={updateForm} onSubmit={submitUser} editing={Boolean(selectedUserId)} /></Modal>}

      {modal === 'details' && selectedUser && <Modal
        title="User profile"
        description="Profile information and recent account activity."
        onClose={() => setModal('')}
        footer={<><button className="button button-secondary" onClick={() => setModal('')}>Close</button><button className="button button-primary" onClick={() => openEditModal(selectedUser)}><Edit3 size={14} />Edit user</button></>}
      ><UserProfile user={selectedUser} today={today} /></Modal>}

      {modal === 'delete' && <Modal
        title={deleteIds.length === 1 ? 'Delete user?' : `Delete ${deleteIds.length} users?`}
        description="This removes the selected record from the local directory."
        onClose={() => { setModal(''); setDeleteIds([]) }}
        footer={<><button className="button button-secondary" onClick={() => { setModal(''); setDeleteIds([]) }}>Cancel</button><button className="button button-danger" onClick={confirmDelete}><Trash2 size={14} />Delete {deleteIds.length === 1 ? 'user' : 'users'}</button></>}
      ><p className="delete-confirm-copy">This sample action is not connected to a backend and cannot be undone in this session.</p></Modal>}
    </div>
  )
}
