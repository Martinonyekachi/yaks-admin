import { useCallback, useEffect, useMemo, useState } from 'react'
import { defaultAdminSettings, settingsModules } from '../data/settings.js'
import { AdminSettingsContext } from './settings-context.jsx'

const STORAGE_KEY = 'yaks-admin-settings-v1'
const PROTECTED_ROLE_ID = 'super-administrator'

function normalizeRoles(roles, defaults) {
  const protectedRole = defaults.roles.find((role) => role.id === PROTECTED_ROLE_ID)
  const customRoles = Array.isArray(roles)
    ? roles.filter((role) => role && typeof role.id === 'string' && role.id !== PROTECTED_ROLE_ID && typeof role.name === 'string')
      .map((role) => ({
        ...role,
        protected: false,
        permissions: Object.fromEntries(settingsModules.map(({ id }) => {
          const modulePermissions = role.permissions?.[id] || {}
          return [id, {
            view: Boolean(modulePermissions.view),
            create: Boolean(modulePermissions.create),
            edit: Boolean(modulePermissions.edit),
            delete: Boolean(modulePermissions.delete),
          }]
        })),
      }))
    : defaults.roles.filter((role) => role.id !== PROTECTED_ROLE_ID)
  return [structuredClone(protectedRole), ...customRoles]
}

function readSavedSettings() {
  const defaults = structuredClone(defaultAdminSettings)
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaults
    const saved = JSON.parse(stored)
    if (!saved || typeof saved !== 'object') throw new TypeError('Stored settings must be an object')
    return {
      ...defaults,
      ...saved,
      general: { ...defaults.general, ...saved.general },
      profile: { ...defaults.profile, ...saved.profile },
      roles: normalizeRoles(saved.roles, defaults),
      appearance: { ...defaults.appearance, ...saved.appearance },
      notifications: { ...defaults.notifications, ...saved.notifications },
      security: { ...defaults.security, ...saved.security },
    }
  } catch (error) {
    console.error('Unable to load saved Yaks settings; defaults will be used.', error)
    return defaults
  }
}

export function AdminSettingsProvider({ children }) {
  const [settings, setSettings] = useState(readSavedSettings)
  const [appearancePreview, setAppearancePreview] = useState(null)
  const appearance = appearancePreview || settings.appearance

  useEffect(() => {
    document.documentElement.dataset.theme = appearance.theme
    document.documentElement.dataset.density = appearance.density
    document.documentElement.dataset.motion = appearance.reduceMotion ? 'reduced' : 'full'
  }, [appearance])

  const saveSection = useCallback((section, value) => {
    if (!Object.prototype.hasOwnProperty.call(defaultAdminSettings, section)) {
      throw new Error(`Unknown settings section: ${section}`)
    }
    if (section === 'roles') {
      if (!Array.isArray(value)) throw new TypeError('Role settings must be an array')
      value = normalizeRoles(value, defaultAdminSettings)
    }
    const next = { ...settings, [section]: value }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (section === 'appearance') setAppearancePreview(null)
    setSettings(next)
  }, [settings])

  const previewAppearance = useCallback((value) => {
    setAppearancePreview(value)
  }, [])

  const contextValue = useMemo(() => ({
    settings,
    profile: settings.profile,
    appearance,
    previewAppearance,
    saveSection,
  }), [appearance, previewAppearance, saveSection, settings])

  return <AdminSettingsContext.Provider value={contextValue}>{children}</AdminSettingsContext.Provider>
}
