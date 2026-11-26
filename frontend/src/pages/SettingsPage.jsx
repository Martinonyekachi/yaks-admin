import { useEffect, useState } from 'react'
import {
  Activity, BadgeCheck, Bell, Building2, CalendarDays, Check, ChevronRight,
  Database, Image, KeyRound, Laptop, Monitor,
  Palette, Pencil, Plus, RotateCcw, Save, Server, Shield, ShieldCheck,
  Smartphone, Trash2, Upload, UserRound,
} from 'lucide-react'
import { Avatar, EmptyState, Modal, PageHeading, PanelHeading, StatusBadge } from '../components/UI.jsx'
import { useAdminSettings } from '../components/settings-context.jsx'
import { useToast } from '../components/toast-context.js'
import { demoLoginActivity, demoSessions, settingsModules } from '../data/settings.js'

const settingsNavigation = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: KeyRound },
  { id: 'system', label: 'System Information', icon: Server },
]

function SettingsField({ label, help, error, className = '', children }) {
  return <label className={`settings-field${className ? ` ${className}` : ''}`}>
    <span>{label}</span>
    {children}
    {help && <small>{help}</small>}
    {error && <small className="settings-field-error" role="alert">{error}</small>}
  </label>
}

function SaveActions({ onCancel, saveLabel = 'Save changes' }) {
  return <div className="settings-save-actions">
    <button className="button button-secondary" type="button" onClick={onCancel}><RotateCcw size={14} />Cancel</button>
    <button className="button button-primary" type="submit"><Save size={14} />{saveLabel}</button>
  </div>
}

function ToggleSetting({ title, description, checked, onChange, disabled = false }) {
  return <div className="settings-toggle-row">
    <span><strong>{title}</strong><small>{description}</small></span>
    <button className={`toggle-switch${checked ? ' on' : ''}`} role="switch" aria-checked={checked} aria-label={title} disabled={disabled} onClick={() => onChange(!checked)} type="button"><i /></button>
  </div>
}

function useSaveToast() {
  const { saveSection } = useAdminSettings()
  const notify = useToast()

  return (section, value, message) => {
    try {
      saveSection(section, value)
      notify(message)
      return true
    } catch (error) {
      console.error(`Unable to save ${section} settings locally.`, error)
      notify('Settings could not be saved to this browser. Check local storage and try again.')
      return false
    }
  }
}

function GeneralSettings({ settings }) {
  const onSave = useSaveToast()
  const [draft, setDraft] = useState(settings.general)
  const [errors, setErrors] = useState({})
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!draft.applicationName.trim()) nextErrors.applicationName = 'Enter an application name.'
    if (!draft.companyName.trim()) nextErrors.companyName = 'Enter a company or business name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.companyEmail)) nextErrors.companyEmail = 'Enter a valid company email address.'
    if (draft.phone && !/^\+?[\d\s()-]{7,20}$/.test(draft.phone)) nextErrors.phone = 'Enter a valid contact phone number.'
    for (const [field, label] of [['website', 'Website URL'], ['logoUrl', 'Application logo URL']]) {
      if (draft[field] && !isWebUrl(draft[field])) nextErrors[field] = `Enter a valid ${label.toLowerCase()}.`
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave('general', draft, 'General settings saved on this device')
  }

  function cancel() {
    setDraft(settings.general)
    setErrors({})
  }

  return <section className="panel settings-panel settings-section-panel">
    <PanelHeading title="General settings" subtitle="Configure the workspace identity, contact details, and regional defaults." />
    <form className="settings-form settings-form-grid" onSubmit={submit} noValidate>
      <SettingsField label="Application name" error={errors.applicationName}><input value={draft.applicationName} onChange={(event) => update('applicationName', event.target.value)} aria-invalid={Boolean(errors.applicationName)} /></SettingsField>
      <SettingsField label="Company or business name" error={errors.companyName}><input value={draft.companyName} onChange={(event) => update('companyName', event.target.value)} aria-invalid={Boolean(errors.companyName)} /></SettingsField>
      <SettingsField label="Company email" error={errors.companyEmail}><input type="email" value={draft.companyEmail} onChange={(event) => update('companyEmail', event.target.value)} aria-invalid={Boolean(errors.companyEmail)} /></SettingsField>
      <SettingsField label="Contact phone" error={errors.phone}><input type="tel" value={draft.phone} onChange={(event) => update('phone', event.target.value)} aria-invalid={Boolean(errors.phone)} /></SettingsField>
      <SettingsField label="Business address" className="settings-field-wide"><textarea rows="2" value={draft.address} onChange={(event) => update('address', event.target.value)} /></SettingsField>
      <SettingsField label="Website URL" help="Optional public website for your business." error={errors.website}><input type="url" value={draft.website} onChange={(event) => update('website', event.target.value)} placeholder="https://example.com" aria-invalid={Boolean(errors.website)} /></SettingsField>
      <SettingsField label="Application logo URL" help="Use a direct image URL; leave blank to use the Yaks mark." error={errors.logoUrl}><input type="url" value={draft.logoUrl} onChange={(event) => update('logoUrl', event.target.value)} placeholder="https://example.com/logo.png" aria-invalid={Boolean(errors.logoUrl)} /></SettingsField>
      <div className="settings-logo-preview">
        <span className="settings-logo-preview-image">{draft.logoUrl ? <img src={draft.logoUrl} alt="Application logo preview" /> : <Image size={20} />}</span>
        <span><strong>Application logo</strong><small>{draft.logoUrl ? 'Preview of the configured logo' : 'Default Yaks mark will be used'}</small></span>
      </div>
      <SettingsField label="Time zone"><select value={draft.timeZone} onChange={(event) => update('timeZone', event.target.value)}><option value="Africa/Lagos">Africa/Lagos (WAT)</option><option value="UTC">UTC</option><option value="Europe/London">Europe/London</option><option value="Africa/Nairobi">Africa/Nairobi (EAT)</option><option value="America/New_York">America/New_York</option></select></SettingsField>
      <SettingsField label="Date format"><select value={draft.dateFormat} onChange={(event) => update('dateFormat', event.target.value)}><option value="dd/MM/yyyy">DD/MM/YYYY</option><option value="MM/dd/yyyy">MM/DD/YYYY</option><option value="yyyy-MM-dd">YYYY-MM-DD</option></select></SettingsField>
      <SettingsField label="Currency preference"><select value={draft.currency} onChange={(event) => update('currency', event.target.value)}><option value="NGN">Nigerian Naira (NGN)</option><option value="USD">US Dollar (USD)</option><option value="GBP">British Pound (GBP)</option><option value="EUR">Euro (EUR)</option></select></SettingsField>
      <div className="settings-form-wide"><SaveActions onCancel={cancel} /></div>
    </form>
  </section>
}

function isWebUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function ProfileSettings({ settings }) {
  const onSave = useSaveToast()
  const notify = useToast()
  const [draft, setDraft] = useState(settings.profile)
  const [errors, setErrors] = useState({})
  const [photoInputKey, setPhotoInputKey] = useState(0)
  const initials = draft.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || 'YA'
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))

  function handlePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrors((current) => ({ ...current, avatarUrl: 'Choose an image file.' }))
      event.target.value = ''
      return
    }
    if (file.size > 1024 * 1024) {
      setErrors((current) => ({ ...current, avatarUrl: 'Choose an image smaller than 1 MB.' }))
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onerror = () => {
      setErrors((current) => ({ ...current, avatarUrl: 'The selected image could not be read.' }))
      notify('The selected profile image could not be read')
    }
    reader.onload = () => {
      update('avatarUrl', String(reader.result || ''))
      setErrors((current) => ({ ...current, avatarUrl: '' }))
    }
    reader.readAsDataURL(file)
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!draft.name.trim()) nextErrors.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) nextErrors.email = 'Enter a valid email address.'
    if (draft.phone && !/^\+?[\d\s()-]{7,20}$/.test(draft.phone)) nextErrors.phone = 'Enter a valid phone number.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave('profile', draft, 'Profile saved on this device')
  }

  function cancel() {
    setDraft(settings.profile)
    setErrors({})
    setPhotoInputKey((current) => current + 1)
  }

  return <section className="panel settings-panel settings-section-panel">
    <PanelHeading title="Administrator profile" subtitle="Update the profile details shown across your workspace." />
    <form className="settings-profile-form" onSubmit={submit} noValidate>
      <div className="settings-profile-photo">
        <Avatar initials={initials} image={draft.avatarUrl} color="lavender" size="large" />
        <div><strong>Profile picture</strong><small>PNG, JPEG, or WebP up to 1 MB. Stored in this browser only.</small></div>
        <label className="button button-secondary"><Upload size={14} />Choose image<input key={photoInputKey} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhoto} /></label>
        {draft.avatarUrl && <button className="button button-quiet" type="button" onClick={() => update('avatarUrl', '')}>Remove</button>}
        {errors.avatarUrl && <small className="settings-field-error photo-error">{errors.avatarUrl}</small>}
      </div>
      <div className="settings-form settings-form-grid">
        <SettingsField label="Full name" error={errors.name}><input value={draft.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} /></SettingsField>
        <SettingsField label="Email address" error={errors.email}><input type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} /></SettingsField>
        <SettingsField label="Phone number" error={errors.phone}><input type="tel" value={draft.phone} onChange={(event) => update('phone', event.target.value)} aria-invalid={Boolean(errors.phone)} /></SettingsField>
        <SettingsField label="Job title"><input value={draft.jobTitle} onChange={(event) => update('jobTitle', event.target.value)} /></SettingsField>
        <SettingsField label="About" className="settings-field-wide"><textarea rows="4" maxLength={400} value={draft.about} onChange={(event) => update('about', event.target.value)} /><small>{draft.about.length}/400 characters</small></SettingsField>
        <div className="settings-account-protection settings-form-wide"><ShieldCheck size={16} /><span><strong>Super Administrator access is protected</strong><small>Your own administrative role cannot be changed from this profile form.</small></span><BadgeCheck size={16} /></div>
        <div className="settings-form-wide"><SaveActions onCancel={cancel} saveLabel="Save profile" /></div>
      </div>
    </form>
  </section>
}

function createRolePermissions() {
  return Object.fromEntries(settingsModules.map(({ id }) => [id, { view: true, create: false, edit: false, delete: false }]))
}

function RolesSettings({ settings }) {
  const onSave = useSaveToast()
  const [selectedRoleId, setSelectedRoleId] = useState('super-administrator')
  const [roleModal, setRoleModal] = useState(null)
  const [roleErrors, setRoleErrors] = useState({})
  const [permissionDraft, setPermissionDraft] = useState(null)
  const [deleteRole, setDeleteRole] = useState(null)
  const roles = settings.roles
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0]
  const permissions = permissionDraft?.roleId === selectedRole?.id ? permissionDraft.permissions : selectedRole?.permissions
  const isProtected = selectedRole?.protected || selectedRole?.id === 'super-administrator'

  function openCreate() {
    setRoleErrors({})
    setRoleModal({ mode: 'create', role: { id: `custom-${Date.now()}`, name: '', description: '', protected: false, permissions: createRolePermissions() } })
  }

  function openEdit(role) {
    if (role.protected || role.id === 'super-administrator') return
    setRoleErrors({})
    setRoleModal({ mode: 'edit', role: { ...role } })
  }

  function updateModalRole(key, value) {
    setRoleModal((current) => ({ ...current, role: { ...current.role, [key]: value } }))
    setRoleErrors((current) => ({ ...current, [key]: '' }))
  }

  function saveRole(event) {
    event.preventDefault()
    const { role, mode } = roleModal
    const errors = {}
    if (!role.name.trim()) errors.name = 'Enter a role name.'
    if (roles.some((item) => item.id !== role.id && item.name.trim().toLowerCase() === role.name.trim().toLowerCase())) errors.name = 'A role with this name already exists.'
    if (!role.description.trim()) errors.description = 'Enter a short role description.'
    setRoleErrors(errors)
    if (Object.keys(errors).length) return
    const nextRoles = mode === 'create'
      ? [...roles, { ...role, name: role.name.trim(), description: role.description.trim() }]
      : roles.map((item) => item.id === role.id ? { ...role, name: role.name.trim(), description: role.description.trim() } : item)
    if (onSave('roles', nextRoles, mode === 'create' ? 'Role created locally' : 'Role details saved locally')) {
      setSelectedRoleId(role.id)
      setRoleModal(null)
    }
  }

  function changePermission(moduleId, permission, checked) {
    if (!selectedRole || isProtected) return
    const nextPermissions = structuredClone(permissions)
    nextPermissions[moduleId][permission] = checked
    setPermissionDraft({ roleId: selectedRole.id, permissions: nextPermissions })
  }

  function savePermissions() {
    if (!selectedRole || !permissionDraft || permissionDraft.roleId !== selectedRole.id || isProtected) return
    const nextRoles = roles.map((role) => role.id === selectedRole.id ? { ...role, permissions: permissionDraft.permissions } : role)
    if (onSave('roles', nextRoles, 'Role permissions saved locally')) setPermissionDraft(null)
  }

  function confirmDelete() {
    if (!deleteRole || deleteRole.protected || deleteRole.id === 'super-administrator') return
    const remaining = roles.filter((role) => role.id !== deleteRole.id)
    if (onSave('roles', remaining, 'Role removed locally')) {
      setSelectedRoleId(remaining[0]?.id || 'super-administrator')
      setPermissionDraft(null)
    }
    setDeleteRole(null)
  }

  if (!selectedRole) return <section className="panel settings-panel"><EmptyState title="No roles available" description="Restore a default role before changing permissions." /></section>

  return <div className="roles-settings-layout">
    <section className="panel roles-list-panel">
      <PanelHeading title="Workspace roles" subtitle={`${roles.length} roles`} action={<button className="button button-primary button-small" onClick={openCreate}><Plus size={14} />Create role</button>} />
      <div className="roles-list">{roles.map((role) => <button key={role.id} className={`role-list-item${selectedRole.id === role.id ? ' selected' : ''}`} onClick={() => setSelectedRoleId(role.id)}>
        <span className="role-list-icon"><Shield size={15} /></span><span className="role-list-copy"><strong>{role.name}{role.protected && <i>Protected</i>}</strong><small>{role.description}</small></span><ChevronRight size={15} />
      </button>)}</div>
    </section>
    <section className="panel role-permissions-panel">
      <PanelHeading title={selectedRole.name} subtitle={selectedRole.description} action={!isProtected && <div className="role-heading-actions"><button className="icon-button" aria-label={`Edit ${selectedRole.name}`} title="Edit role details" onClick={() => openEdit(selectedRole)}><Pencil size={15} /></button><button className="icon-button role-delete-button" aria-label={`Delete ${selectedRole.name}`} title="Delete role" onClick={() => setDeleteRole(selectedRole)}><Trash2 size={15} /></button></div>} />
      {isProtected && <div className="protected-role-note"><ShieldCheck size={15} /><span><strong>Protected administrator role</strong><small>All permissions stay enabled to preserve the signed-in Super Administrator's essential access.</small></span></div>}
      <div className="permission-matrix-wrap"><table className="permission-matrix">
        <thead><tr><th>Module</th>{['View', 'Create', 'Edit', 'Delete'].map((name) => <th key={name}>{name}</th>)}</tr></thead>
        <tbody>{settingsModules.map((module) => <tr key={module.id}><th scope="row">{module.label}</th>{['view', 'create', 'edit', 'delete'].map((permission) => <td key={permission}><label className="permission-check"><input type="checkbox" checked={Boolean(permissions?.[module.id]?.[permission])} disabled={isProtected} aria-label={`${module.label}: ${permission}`} onChange={(event) => changePermission(module.id, permission, event.target.checked)} /><span /></label></td>)}</tr>)}</tbody>
      </table></div>
      {!isProtected && <div className="settings-save-actions role-permission-actions"><button className="button button-secondary" type="button" disabled={!permissionDraft || permissionDraft.roleId !== selectedRole.id} onClick={() => setPermissionDraft(null)}><RotateCcw size={14} />Discard</button><button className="button button-primary" type="button" disabled={!permissionDraft || permissionDraft.roleId !== selectedRole.id} onClick={savePermissions}><Save size={14} />Save permissions</button></div>}
      <p className="settings-demo-note">Role and permission changes are stored locally for this demonstration; there is no authorization backend.</p>
      {roleModal && <Modal title={roleModal.mode === 'create' ? 'Create workspace role' : 'Edit role details'} description="Role changes are saved in this browser only." onClose={() => setRoleModal(null)} footer={null}>
        <form className="settings-modal-form" onSubmit={saveRole} noValidate>
          <SettingsField label="Role name" error={roleErrors.name}><input autoFocus value={roleModal.role.name} onChange={(event) => updateModalRole('name', event.target.value)} aria-invalid={Boolean(roleErrors.name)} /></SettingsField>
          <SettingsField label="Description" error={roleErrors.description}><textarea rows="3" value={roleModal.role.description} onChange={(event) => updateModalRole('description', event.target.value)} aria-invalid={Boolean(roleErrors.description)} /></SettingsField>
          <div className="settings-save-actions"><button className="button button-secondary" type="button" onClick={() => setRoleModal(null)}>Cancel</button><button className="button button-primary" type="submit">{roleModal.mode === 'create' ? 'Create role' : 'Save role'}</button></div>
        </form>
      </Modal>}
      {deleteRole && <Modal title="Delete role?" description={`This will remove ${deleteRole.name} from the local role list.`} onClose={() => setDeleteRole(null)} footer={<><button className="button button-secondary" onClick={() => setDeleteRole(null)}>Cancel</button><button className="button button-danger" onClick={confirmDelete}>Delete role</button></>}>
        <p className="settings-demo-note">The Super Administrator role is protected and cannot be deleted.</p>
      </Modal>}
    </section>
  </div>
}

function AppearanceSettings({ settings }) {
  const onSave = useSaveToast()
  const { previewAppearance } = useAdminSettings()
  const [draft, setDraft] = useState(settings.appearance)

  useEffect(() => () => previewAppearance(null), [previewAppearance])

  function update(key, value) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    previewAppearance(next)
  }

  function cancel() {
    setDraft(settings.appearance)
    previewAppearance(null)
  }

  return <section className="panel settings-panel settings-section-panel">
    <PanelHeading title="Appearance" subtitle="Choose how Yaks Admin Panel looks and how workspace navigation is displayed." />
    <form onSubmit={(event) => { event.preventDefault(); onSave('appearance', draft, 'Appearance preferences applied') }}>
      <div className="settings-subsection"><h3>Color theme</h3><p>Changes preview immediately. Apply appearance to save them, or Cancel to restore your saved preferences.</p>
        <div className="theme-options">
          {[
            { id: 'dark', title: 'Dark', text: 'Deep charcoal surfaces and refined contrast' },
            { id: 'light', title: 'Light', text: 'Soft neutral surfaces for brighter environments' },
          ].map((theme) => <button className={`theme-option${draft.theme === theme.id ? ' selected' : ''}`} key={theme.id} type="button" aria-pressed={draft.theme === theme.id} onClick={() => update('theme', theme.id)}>
            <span className={`theme-preview theme-preview-${theme.id}`}><i /><i /><i /></span><span><strong>{theme.title}</strong><small>{theme.text}</small></span>{draft.theme === theme.id && <Check size={16} />}
          </button>)}
        </div>
      </div>
      <div className="settings-subsection"><h3>Layout density</h3><p>Adjust spacing in tables, panels, and navigation.</p>
        <div className="density-options">{[['comfortable', 'Comfortable', 'More breathing room'], ['compact', 'Compact', 'More information on screen']].map(([value, title, caption]) => <label className={`density-option${draft.density === value ? ' selected' : ''}`} key={value}><input type="radio" name="density" value={value} checked={draft.density === value} onChange={() => update('density', value)} /><span><strong>{title}</strong><small>{caption}</small></span></label>)}</div>
      </div>
      <div className="settings-subsection settings-preference-section"><h3>Display preferences</h3>
        <ToggleSetting title="Collapsed desktop sidebar" description="Keep the desktop navigation in its compact icon-only mode." checked={draft.sidebarCollapsed} onChange={(value) => update('sidebarCollapsed', value)} />
        <ToggleSetting title="Reduce motion" description="Disable non-essential interface transitions and animation." checked={draft.reduceMotion} onChange={(value) => update('reduceMotion', value)} />
      </div>
      <SaveActions onCancel={cancel} saveLabel="Apply appearance" />
    </form>
  </section>
}

function NotificationPreferences({ settings }) {
  const onSave = useSaveToast()
  const [draft, setDraft] = useState(settings.notifications)
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))

  return <section className="panel settings-panel settings-section-panel">
    <PanelHeading title="Notification preferences" subtitle="Choose which workspace events to receive by email or in-app." />
    <form onSubmit={(event) => { event.preventDefault(); onSave('notifications', draft, 'Notification preferences saved on this device') }}>
      <div className="settings-preference-section">
        <h3>Delivery channels</h3>
        <ToggleSetting title="Email notifications" description="Allow workspace updates to be sent to your profile email." checked={draft.emailEnabled} onChange={(value) => update('emailEnabled', value)} />
        <ToggleSetting title="In-app notifications" description="Show relevant updates in the Yaks notification centre." checked={draft.inAppEnabled} onChange={(value) => update('inAppEnabled', value)} />
      </div>
      <div className="settings-preference-section">
        <h3>Workspace alerts</h3>
        <ToggleSetting title="Transaction alerts" description="Successful, pending, failed, and refunded transactions." checked={draft.transactions} onChange={(value) => update('transactions', value)} />
        <ToggleSetting title="User registration alerts" description="New accounts and important user profile changes." checked={draft.userRegistrations} onChange={(value) => update('userRegistrations', value)} />
        <ToggleSetting title="System update alerts" description="Maintenance notices and workspace product updates." checked={draft.systemUpdates} onChange={(value) => update('systemUpdates', value)} />
        <ToggleSetting title="Security alerts" description="Sign-in events and changes to account security settings." checked={draft.securityAlerts} onChange={(value) => update('securityAlerts', value)} />
      </div>
      <p className="settings-demo-note">Preferences are saved locally. Email delivery and alert routing are not connected in this demo.</p>
      <SaveActions onCancel={() => setDraft(settings.notifications)} saveLabel="Save preferences" />
    </form>
  </section>
}

function SecuritySettings({ settings }) {
  const onSave = useSaveToast()
  const notify = useToast()
  const [draft, setDraft] = useState(settings.security)
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')

  function changePassword(event) {
    event.preventDefault()
    if (!password.current) return setPasswordError('Enter your current password to continue.')
    if (password.next.length < 12 || !/[A-Z]/.test(password.next) || !/[a-z]/.test(password.next) || !/\d/.test(password.next)) {
      return setPasswordError('Use at least 12 characters with uppercase, lowercase, and a number.')
    }
    if (password.next !== password.confirm) return setPasswordError('The new passwords do not match.')
    setPassword({ current: '', next: '', confirm: '' })
    setPasswordError('')
    notify('Demo only: no password was changed. Authentication is not connected.')
  }

  function saveSecurity(event) {
    event.preventDefault()
    onSave('security', draft, 'Demo security preferences saved locally')
  }

  return <div className="security-settings-stack">
    <section className="panel settings-panel settings-section-panel">
      <PanelHeading title="Password" subtitle="Password changes are demonstration-only until an authentication service is connected." />
      <form className="settings-form settings-form-grid" onSubmit={changePassword} noValidate>
        <SettingsField label="Current password" className="settings-field-wide"><input type="password" autoComplete="current-password" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))} /></SettingsField>
        <SettingsField label="New password"><input type="password" autoComplete="new-password" value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))} /></SettingsField>
        <SettingsField label="Confirm new password"><input type="password" autoComplete="new-password" value={password.confirm} onChange={(event) => setPassword((current) => ({ ...current, confirm: event.target.value }))} /></SettingsField>
        <small className={`settings-field-error settings-form-wide${passwordError ? '' : ' password-hint'}`} role={passwordError ? 'alert' : undefined}>{passwordError || 'Use at least 12 characters, including uppercase, lowercase, and a number.'}</small>
        <div className="settings-form-wide"><button className="button button-secondary" type="submit"><KeyRound size={14} />Validate password change</button></div>
      </form>
    </section>
    <section className="panel settings-panel settings-section-panel">
      <PanelHeading title="Sign-in protection" subtitle="These toggles demonstrate preferences only; they do not enforce authentication controls." />
      <form onSubmit={saveSecurity}>
        <div className="settings-preference-section">
          <ToggleSetting title="Two-factor authentication" description="Demo state only. No verification challenge will be requested at sign-in." checked={draft.twoFactorEnabled} onChange={(value) => setDraft((current) => ({ ...current, twoFactorEnabled: value }))} />
          <ToggleSetting title="Sign-in alerts" description="Demo preference for notifying you about account sign-ins." checked={draft.loginAlerts} onChange={(value) => setDraft((current) => ({ ...current, loginAlerts: value }))} />
          <ToggleSetting title="Automatic session lock" description="Demo preference only; no session timeout is enforced." checked={draft.autoLock} onChange={(value) => setDraft((current) => ({ ...current, autoLock: value }))} />
        </div>
        <p className="settings-demo-note">Security preferences are stored locally and do not replace server-side authentication or authorization.</p>
        <SaveActions onCancel={() => setDraft(settings.security)} saveLabel="Save demo preferences" />
      </form>
    </section>
    <section className="panel settings-panel settings-section-panel">
      <PanelHeading title="Active sessions" subtitle="Sample session information for this local demonstration." />
      <div className="settings-session-list">{demoSessions.map((session) => <article className="settings-session" key={session.id}>
        <span className="settings-session-icon">{session.device === 'Mobile device' ? <Smartphone size={17} /> : <Laptop size={17} />}</span>
        <span className="settings-session-details"><strong>{session.device}{session.current && <i>Current</i>}</strong><small>{session.browser} · {session.location}</small></span>
        <time>{session.lastActive}</time>
      </article>)}</div>
    </section>
    <section className="panel settings-panel settings-section-panel">
      <PanelHeading title="Login activity" subtitle="Example activity records; these are not read from an authentication service." />
      <div className="settings-login-list">{demoLoginActivity.map((entry) => <article className="settings-login-entry" key={entry.id}>
        <span className={`login-outcome-icon${entry.outcome === 'Blocked' ? ' blocked' : ''}`}>{entry.outcome === 'Blocked' ? <Shield size={15} /> : <Check size={15} />}</span>
        <span><strong>{entry.event}</strong><small>{entry.browser} · {entry.location}</small></span>
        <time>{entry.time}</time>
        <StatusBadge>{entry.outcome}</StatusBadge>
      </article>)}</div>
    </section>
  </div>
}

function SystemInformation() {
  const [updatedAt] = useState(() => new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date()))
  const values = [
    { icon: Monitor, label: 'Application version', value: '0.0.0', note: 'Local development build' },
    { icon: Activity, label: 'Environment', value: import.meta.env.MODE, note: 'Vite frontend environment' },
    { icon: Database, label: 'Database status', value: 'Not connected', note: 'Demo status; no database is configured' },
    { icon: CalendarDays, label: 'Last system update', value: updatedAt, note: 'Displayed from the current local date' },
  ]

  return <div className="system-information-stack">
    <section className="panel settings-panel settings-section-panel">
      <PanelHeading title="System information" subtitle="Frontend and sample configuration details. Infrastructure is not monitored by this demo." />
      <div className="system-information-grid">{values.map(({ icon: Icon, label, value, note }) => <article className="system-information-card" key={label}>
        <span className="system-information-icon"><Icon size={16} /></span><span><small>{label}</small><strong>{value}</strong><i>{note}</i></span>
      </article>)}</div>
    </section>
    <section className="panel settings-panel settings-section-panel">
      <PanelHeading title="System health overview" subtitle="Explicitly limited to this frontend demo; no infrastructure checks are performed." />
      <div className="system-health-list">
        <div><span className="system-health-indicator ready" /><span><strong>Admin interface</strong><small>Rendering locally in the browser</small></span><StatusBadge>Available</StatusBadge></div>
        <div><span className="system-health-indicator demo" /><span><strong>Data source</strong><small>Static sample records and browser storage</small></span><StatusBadge>Demo</StatusBadge></div>
        <div><span className="system-health-indicator disconnected" /><span><strong>Database and authentication</strong><small>No backend services are connected</small></span><StatusBadge>Not connected</StatusBadge></div>
      </div>
      <div className="system-demo-banner"><ShieldCheck size={17} /><span><strong>Demo environment</strong><small>Settings persist in this browser. No operational or infrastructure status is being reported.</small></span></div>
    </section>
  </div>
}

const sectionComponents = {
  general: GeneralSettings,
  profile: ProfileSettings,
  roles: RolesSettings,
  appearance: AppearanceSettings,
  notifications: NotificationPreferences,
  security: SecuritySettings,
  system: SystemInformation,
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const { settings } = useAdminSettings()
  const SelectedSection = sectionComponents[activeSection]

  return <div className="workspace-page settings-page settings-admin-page">
    <PageHeading eyebrow="WORKSPACE" title="Settings & Administration" description="Manage workspace details, access, preferences, and demonstration security controls." />
    <div className="settings-admin-layout">
      <nav className="settings-section-nav" aria-label="Settings sections">
        <span className="settings-nav-label">ADMINISTRATION</span>
        {settingsNavigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={`settings-nav-item${activeSection === id ? ' active' : ''}`} aria-current={activeSection === id ? 'page' : undefined} onClick={() => setActiveSection(id)}><Icon size={16} /><span>{label}</span><ChevronRight size={14} /></button>)}
        <div className="settings-local-note"><ShieldCheck size={15} /><span>Local demo settings</span></div>
      </nav>
      <div className="settings-section-content"><SelectedSection settings={settings} /></div>
    </div>
  </div>
}
