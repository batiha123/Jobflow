import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  User, 
  Users,
  FileCheck2, 
  ShieldCheck, 
  ArrowLeft,
  Plus,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './DashboardLayout.css';

export function DashboardLayout({ 
  activeTab = 'dashboard', 
  onTabChange, 
  children,
  onOpenCreateModal 
}) {
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || 'CANDIDATE';

  const roleMenus = {
    COMPANY: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'profile', label: 'Profil Entreprise', icon: Building2 },
      { id: 'offers', label: 'Mes Offres d’emploi', icon: Briefcase },
      { id: 'applications', label: 'Candidatures reçues', icon: FileCheck2 },
    ],
    CANDIDATE: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'profile', label: 'Mon Profil Candidat', icon: User },
      { id: 'applications', label: 'Mes Candidatures', icon: FileCheck2 },
    ],
    ADMIN: [
      { id: 'dashboard', label: 'Vue d’ensemble', icon: LayoutDashboard },
      { id: 'users', label: 'Gestion Utilisateurs', icon: Users },
      { id: 'moderation', label: 'Modération & Rapports', icon: ShieldCheck },
    ]
  };

  const navItems = roleMenus[userRole] || roleMenus.CANDIDATE;

  const getRoleLabel = (role) => {
    if (role === 'COMPANY') return 'Espace Recruteur';
    if (role === 'CANDIDATE') return 'Espace Candidat';
    if (role === 'ADMIN') return 'Administration';
    return role;
  };

  return (
    <div className="dashboard-root">
      {/* Left Sidebar */}
      <aside className="dashboard-sidebar">
        <div>
          {/* User info card in sidebar */}
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{currentUser?.name || 'Mon Compte'}</span>
              <span className="sidebar-role-badge">{getRoleLabel(userRole)}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <ul className="sidebar-nav-list">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="sidebar-bottom-actions">
          {userRole === 'COMPANY' && onOpenCreateModal && (
            <button
              type="button"
              className="btn-register-pill"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onOpenCreateModal}
            >
              <Plus size={16} />
              <span>Publier une offre</span>
            </button>
          )}

          <Link 
            to="/" 
            className="sidebar-nav-btn"
            style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}
          >
            <ArrowLeft size={16} />
            <span>Retour au site</span>
          </Link>

          <button
            type="button"
            className="sidebar-nav-btn sidebar-logout-btn"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main-area">
        {children}
      </main>
    </div>
  );
}
