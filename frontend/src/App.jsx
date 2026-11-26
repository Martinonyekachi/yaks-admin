import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { NotificationsProvider } from './components/notifications-provider.jsx'
import { AdminSettingsProvider } from './components/settings-provider.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { NotificationsPage } from './pages/WorkspacePages.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AdminSettingsProvider>
          <NotificationsProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </NotificationsProvider>
        </AdminSettingsProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
