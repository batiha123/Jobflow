import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, ChevronDown, User, LogOut, LayoutDashboard, Bell, Check, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../AuthModal/AuthModal';
import api from '../../services/api';
import './Navbar.css';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Notifications state (Person 4 Backend Integration)
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    if (currentUser?.id) {
      const count = await api.notifications.getUnreadCount(currentUser.id);
      setUnreadCount(typeof count === 'number' ? count : 0);
      const list = await api.notifications.getUserNotifications(currentUser.id);
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    await api.notifications.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

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
              // When user is LOGGED IN: Show their real account, Notifications bell, & Mon Espace
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                
                {/* Notification Bell Dropdown (Person 4) */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      fetchNotifications();
                    }}
                    style={{
                      position: 'relative',
                      background: notificationsOpen ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
                      border: '1px solid var(--border-default, #e2e8f0)',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary, #1e293b)',
                      transition: 'all 0.2s ease'
                    }}
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        minWidth: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {notificationsOpen && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '320px',
                      maxHeight: '400px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e2e8f0',
                      zIndex: 1000,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc'
                      }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '28px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            Aucune notification pour le moment.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                              style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #f8fafc',
                                background: n.isRead ? '#ffffff' : '#f0fdf4',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px'
                              }}
                            >
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: n.isRead ? 'transparent' : '#22c55e',
                                marginTop: '6px',
                                flexShrink: 0
                              }} />
                              <div style={{ flex: 1 }}>
                                <p style={{
                                  fontSize: '0.84rem',
                                  color: n.isRead ? '#475569' : '#0f172a',
                                  fontWeight: n.isRead ? 400 : 600,
                                  lineHeight: 1.4,
                                  margin: 0
                                }}>
                                  {n.message}
                                </p>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                  <Clock size={11} />
                                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Récemment'}
                                </span>
                              </div>
                              {!n.isRead && (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  title="Marquer comme lu"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#16a34a',
                                    cursor: 'pointer',
                                    padding: '4px'
                                  }}
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
