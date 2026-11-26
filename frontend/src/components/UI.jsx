import { X } from 'lucide-react'

export function PageHeading({ eyebrow, title, description, actions }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  )
}

export function PanelHeading({ title, subtitle, action }) {
  return (
    <div className="panel-heading">
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {action}
    </div>
  )
}

export function Avatar({ initials, image, color = 'blue', size = 'normal' }) {
  return <span className={`avatar avatar-${color} avatar-${size}`}>{image ? <img src={image} alt="" /> : initials}</span>
}

export function StatusBadge({ children }) {
  const value = String(children).toLowerCase().replace(/\s+/g, '-')
  return <span className={`status-badge status-${value}`}><span className="status-dot" />{children}</span>
}

export function Modal({ title, description, children, onClose, footer, className = '' }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`modal${className ? ` ${className}` : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-content">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </section>
    </div>
  )
}

export function EmptyState({ title, description }) {
  return <div className="empty-state"><span className="empty-symbol">–</span><strong>{title}</strong><p>{description}</p></div>
}

