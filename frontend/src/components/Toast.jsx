import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { ToastContext } from './toast-context.js'

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const notify = useCallback((message) => {
    setToast(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 3000)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check"><Check size={15} /></span>
          <span>{toast}</span>
          <button className="icon-button toast-close" aria-label="Dismiss notification" onClick={() => { window.clearTimeout(timer.current); setToast(null) }}><X size={15} /></button>
        </div>
      )}
    </ToastContext.Provider>
  )
}
