export function Logo() { return <div className="logo"><span className="logo-mark">✦</span> job<span>flow</span></div> }

export function JobCard({ job, onSelect, applied }) {
  return <article className="job-card"><div className="job-card-top"><div className="company-logo" style={{ background: job.color }}>{job.logo}</div><button className="bookmark" aria-label="Enregistrer l’offre">♡</button></div><button className="job-title" onClick={() => onSelect(job)}>{job.title}</button><p className="company-name">{job.company}</p><div className="job-meta"><span>⌖ {job.location}</span><span>◷ {job.type}</span></div><div className="tags">{job.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="job-bottom"><span>{job.posted}</span>{applied ? <strong className="applied">Candidature envoyée</strong> : <button className="text-button" onClick={() => onSelect(job)}>Voir l’offre →</button>}</div></article>
}

export function StatCard({ label, value, change, color = 'blue' }) { return <div className="dash-stat"><span className={`stat-icon ${color}`}>✦</span><small>{label}</small><strong>{value}</strong>{change && <em>↑ {change}</em>}</div> }
