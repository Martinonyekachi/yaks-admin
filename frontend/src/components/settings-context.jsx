import { createContext, useContext } from 'react'

export const AdminSettingsContext = createContext(undefined)

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext)
  if (!context) throw new Error('useAdminSettings must be used within an AdminSettingsProvider')
  return context
}
