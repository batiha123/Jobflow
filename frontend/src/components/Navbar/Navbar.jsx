import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../AuthModal/AuthModal';
import './Navbar.css';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const openAuth = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleLabel = (role) => {
    if (role === 'COMPANY') return 'Recruteur';
    if (role === 'CANDIDATE') return 'Candidat';
    if (role === 'ADMIN') return 'Admin';
    return role;
  };

  return (
    <>
      <header className="navbar-container">
        <div className="container navbar-inner">
          {/* Logo matching mockup */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon">
              <span className="brand-icon-bar"></span>
              <span className="brand-icon-bar"></span>
              <span className="brand-icon-bar"></span>
            </div>
            <span>JobFlow<span className="brand-dot">.</span></span>
          </Link>

          {/* Navigation Links — Real Website Navigation */}
          <nav>
            <ul className="navbar-nav">
              <li>
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/offres" className={`nav-link ${location.pathname.startsWith('/offres') ? 'active' : ''}`}>
                  Offres <span className="nav-badge">+124</span>
                </Link>
              </li>
              <li>
                <Link to="/entreprises" className={`nav-link ${location.pathname === '/entreprises' ? 'active' : ''}`}>
                  Entreprises
                </Link>
              </li>
              <li>
                <Link to="/offres?type=tech" className="nav-link">
                  Carrières Tech
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right Actions: Real Connexion & S'inscrire or Logged In User */}
          <div className="navbar-actions">
            <div className="lang-picker" title="Langue">
              <Globe size={16} />
              <span>FR</span>
              <ChevronDown size={14} />
            </div>

            {currentUser ? (
              // When user is LOGGED IN: Show their real account & Mon Espace
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/tableau-de-bord" className="user-logged-pill" title="Accéder à mon espace">
                  <div className="user-avatar-circle">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-info-text">
                    <span className="user-display-name">{currentUser.name}</span>
                    <span className="user-role-badge">{getRoleLabel(currentUser.role)}</span>
                  </div>
                </Link>

                <Link to="/tableau-de-bord" className="btn-register-pill" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                  <LayoutDashboard size={15} />
                  <span>Mon Espace</span>
                </Link>

                <button 
                  type="button" 
                  className="btn-logout-icon" 
                  title="Se déconnecter"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              // When user is NOT LOGGED IN: Real Connexion & S'inscrire buttons
              <>
                <button 
                  type="button" 
                  className="btn-login"
                  onClick={() => openAuth('login')}
                >
                  Connexion
                </button>

                <button 
                  type="button" 
                  className="btn-register-pill"
                  onClick={() => openAuth('register')}
                >
                  <span>S'inscrire</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Real Auth Modal for Connexion & S'inscrire */}
      {authModalOpen && (
        <AuthModal 
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            navigate('/tableau-de-bord');
          }}
        />
      )}
    </>
  );
}
