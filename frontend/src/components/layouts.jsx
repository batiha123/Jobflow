import { useState } from 'react'
import { Logo } from './shared.jsx'

const navByRole = {
  candidate: [['dashboard', 'Tableau de bord'], ['profile', 'Mon profil'], ['applications', 'Mes candidatures'], ['cv', 'Mon CV & analyse IA'], ['tests', 'Mes tests']],
  company: [['dashboard', 'Tableau de bord'], ['offers', 'Mes offres'], ['candidates', 'Candidats'], ['profile', 'Profil entreprise'], ['statistics', 'Statistiques']],
  admin: [['dashboard', 'Tableau de bord'], ['users', 'Utilisateurs'], ['moderation', 'Modération'], ['statistics', 'Statistiques']],
}

export function WorkspaceLayout({ role, page, onNavigate, onRoleChange, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="dashboard-layout"><aside className={`sidebar ${menuOpen ? 'open' : ''}`}><Logo /><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button><div className="role-switch"><small>MODE DÉMO</small>{[['candidate', 'Candidat'], ['company', 'Entreprise'], ['admin', 'Admin']].map(([value, label]) => <button className={role === value ? 'selected' : ''} key={value} onClick={() => { onRoleChange(value); onNavigate('dashboard') }}>{label}</button>)}</div>{navByRole[role].map(([key, label]) => <button className={`side-link ${page === key ? 'active' : ''}`} key={key} onClick={() => onNavigate(key)}>{label}</button>)}<div className="sidebar-bottom"><button onClick={() => onNavigate('home')}>← Retour au site</button><button onClick={() => onNavigate('home')}>↪ Quitter la démo</button></div></aside><div className="workspace-content">{children}</div></div>
}
