export function Button({ children, variant = 'primary', onClick, type = 'button' }) {
  return <button type={type} className={`button ${variant}`} onClick={onClick}>{children}</button>
}

export function Status({ status }) {
  return <span className={`status ${status === 'En entretien' ? 'interview' : status === 'Refusée' ? 'rejected' : ''}`}>{status}</span>
}

export function Feedback({ children, error = false }) {
  return <div className={`feedback ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div>
}

export function PageHeader({ eyebrow, title, children }) {
  return <div className="dashboard-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1></div>{children}</div>
}
