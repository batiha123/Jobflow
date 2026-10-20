import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { CompanyProfileForm } from '../components/CompanyProfile/CompanyProfileForm';
import { CandidateProfileForm } from '../components/CandidateProfile/CandidateProfileForm';
import { JobOfferForm } from '../components/JobOfferModal/JobOfferForm';
import { ApplicationsView } from '../components/Applications/ApplicationsView';
import { AuthModal } from '../components/AuthModal/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../data/dbStore';
import { api } from '../services/api';
import { 
  Briefcase, 
  Users, 
  FileCheck2, 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  LogIn,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Search,
  ExternalLink
} from 'lucide-react';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const currentRole = currentUser?.role || 'CANDIDATE';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // User-scoped data
  const [myOffers, setMyOffers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [globalStats, setGlobalStats] = useState({ 
    totalUsers: 0, 
    candidateUsers: 0, 
    companyUsers: 0, 
    totalOffers: 0, 
    publishedOffers: 0, 
    totalApplications: 0,
    totalInterviews: 0,
    pendingReports: 0 
  });

  // Admin-scoped data
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const refreshData = async () => {
    if (!currentUser) return;
    
    if (currentRole === 'COMPANY') {
      try {
        const liveOffers = await api.jobs.getCompanyOffers(currentUser.id);
        const liveApps = await api.applications.getCompanyApplications(currentUser.id, currentUser);
        setMyOffers(Array.isArray(liveOffers) ? liveOffers : db.getJobOffersForCompany(currentUser));
        setMyApplications(Array.isArray(liveApps) ? liveApps : db.getApplicationsForCompany(currentUser));
      } catch (err) {
        setMyOffers(db.getJobOffersForCompany(currentUser));
        setMyApplications(db.getApplicationsForCompany(currentUser));
      }
    } else if (currentRole === 'CANDIDATE') {
      try {
        const liveApps = await api.applications.getCandidateApplications(currentUser.id, currentUser);
        const liveProf = await api.candidates.getProfile(currentUser.id);
        setMyApplications(Array.isArray(liveApps) ? liveApps : db.getApplicationsForCandidate(currentUser));
        setCandidateProfile(liveProf || db.getCandidateProfileByUser(currentUser));
      } catch (err) {
        setMyApplications(db.getApplicationsForCandidate(currentUser));
        setCandidateProfile(db.getCandidateProfileByUser(currentUser));
      }
    } else if (currentRole === 'ADMIN') {
      try {
        const stats = await api.admin.getStats();
        const users = await api.admin.getUsers();
        const reports = await api.admin.getReports();
        if (stats) setGlobalStats(stats);
        if (Array.isArray(users)) setAdminUsers(users);
        if (Array.isArray(reports)) setAdminReports(reports);
      } catch (err) {
        setGlobalStats({
          totalUsers: db.getUsers().length,
          candidateUsers: db.getUsers().filter(u => u.role === 'CANDIDATE').length,
          companyUsers: db.getUsers().filter(u => u.role === 'COMPANY').length,
          totalOffers: db.getJobOffers().length,
          publishedOffers: db.getJobOffers().length,
          totalApplications: 4,
          totalInterviews: 1,
          pendingReports: 1
        });
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser, currentRole]);

  const computeProfileCompleteness = (prof) => {
    if (!prof) return 30;
    let score = 0;
    if (prof.name) score += 20;
    if (prof.email) score += 20;
    if (prof.phone && prof.phone.trim().length > 0) score += 10;
    if (prof.headline && prof.headline.trim().length > 0) score += 15;
    if (prof.skills && prof.skills.trim().length > 0) score += 15;
    if (prof.about_me && prof.about_me.trim().length > 0) score += 10;
    if (prof.experience || prof.education) score += 10;
    return Math.min(score, 100);
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm("Êtes-vous certain de vouloir supprimer cette offre d'emploi ?")) {
      return;
    }
    try {
      await api.jobs.delete(id, currentUser.id);
    } catch (err) {
      console.warn("Échec suppression API offre, fallback local:", err);
    }
    db.deleteJobOffer(id);
    refreshData();
  };

  // Admin action: Toggle user account status (ACTIVE / SUSPENDED)
  const handleToggleUserStatus = async (user) => {
    const newStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.admin.updateUserStatus(user.id, newStatus);
    } catch (err) {
      console.warn("Erreur mise à jour statut utilisateur:", err);
    }
    setAdminUsers(prev => prev.map(u => u.id === user.id ? { ...u, accountStatus: newStatus } : u));
  };

  // Admin action: Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur de la plateforme ?")) {
      return;
    }
    try {
      await api.admin.deleteUser(userId);
    } catch (err) {
      console.warn("Erreur suppression utilisateur:", err);
    }
    setAdminUsers(prev => prev.filter(u => u.id !== userId));
    refreshData();
  };

  // Admin action: Resolve report
  const handleResolveReport = async (reportId, deleteOffer) => {
    try {
      await api.admin.resolveReport(reportId, deleteOffer ? 'ACTION_TAKEN' : 'REVIEWED', deleteOffer);
    } catch (err) {
      console.warn("Erreur traitement signalement:", err);
    }
    setAdminReports(prev => prev.map(r => r.id === reportId ? { ...r, status: deleteOffer ? 'ACTION_TAKEN' : 'REVIEWED' } : r));
    refreshData();
  };

  // If not logged in, show authentic unauthenticated state
  if (!currentUser) {
    return (
      <div>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-page)' }}>
          <div style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-surface)', padding: '48px 36px', borderRadius: '24px', textAlign: 'center', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <LogIn size={28} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
              Connexion requise
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
              Vous devez être connecté à votre compte JobFlow pour accéder à votre espace de gestion, vos candidatures ou vos offres d'emploi.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-register-pill"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                onClick={() => setShowAuthModal(true)}
              >
                Se connecter
              </button>
              <Link 
                to="/" 
                className="btn-secondary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal 
            initialMode="login" 
            onClose={() => setShowAuthModal(false)} 
            onSuccess={() => setShowAuthModal(false)} 
          />
        )}
      </div>
    );
  }

  const candidateInterviewsCount = myApplications.filter(a => a.interview && (a.interview.scheduledAt || a.interview.scheduled_at)).length;
  const companyInterviewsCount = myApplications.filter(a => a.interview && (a.interview.scheduledAt || a.interview.scheduled_at)).length;
  const candidateCompleteness = computeProfileCompleteness(candidateProfile);

  // Filtered users for Admin view
  const filteredAdminUsers = adminUsers.filter(u => {
    const matchesSearch = !userSearchTerm || 
      (u.name && u.name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase()));
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <Navbar />

      <DashboardLayout
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenCreateModal={() => {
          setEditingOffer(null);
          setIsOfferModalOpen(true);
        }}
      >
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>
                  {currentRole === 'COMPANY' && `Espace Recruteur — ${currentUser.companyName || currentUser.name}`}
                  {currentRole === 'CANDIDATE' && `Bienvenue, ${currentUser.name} 👋`}
                  {currentRole === 'ADMIN' && "Espace Administration & Métriques Globales"}
                </h1>
                <p>
                  {currentRole === 'COMPANY' && "Gérez vos recrutements, vos annonces actives et consultez les candidatures reçues."}
                  {currentRole === 'CANDIDATE' && "Suivez vos candidatures en direct, préparez vos entretiens et mettez à jour votre CV."}
                  {currentRole === 'ADMIN' && "Contrôle global de la plateforme, gestion des comptes utilisateurs et modération des annonces."}
                </p>
              </div>

              {currentRole === 'COMPANY' && (
                <button
                  type="button"
                  className="btn-register-pill"
                  onClick={() => {
                    setEditingOffer(null);
                    setIsOfferModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Publier une offre</span>
                </button>
              )}
            </div>

            {/* Metrics Row */}
            <div className="metric-cards-row">
              {currentRole === 'COMPANY' && (
                <>
                  <div className="metric-card">
                    <span className="metric-card-title">Offres Publiées</span>
                    <span className="metric-card-val">{myOffers.length}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Candidatures reçues</span>
                    <span className="metric-card-val">{myApplications.length}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Entretiens programmés</span>
                    <span className="metric-card-val">{companyInterviewsCount}</span>
                  </div>
                </>
              )}

              {currentRole === 'CANDIDATE' && (
                <>
                  <div className="metric-card">
                    <span className="metric-card-title">Mes Candidatures</span>
                    <span className="metric-card-val">{myApplications.length}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Entretiens prévus</span>
                    <span className="metric-card-val">{candidateInterviewsCount}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Profil Complété</span>
                    <span className="metric-card-val" style={{ color: candidateCompleteness > 70 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                      {candidateCompleteness}%
                    </span>
                  </div>
                </>
              )}

              {currentRole === 'ADMIN' && (
                <>
                  <div className="metric-card">
                    <span className="metric-card-title">Total Utilisateurs</span>
                    <span className="metric-card-val">{globalStats.totalUsers}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Candidats / Entreprises</span>
                    <span className="metric-card-val" style={{ fontSize: '1.4rem' }}>
                      {globalStats.candidateUsers} / {globalStats.companyUsers}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Offres Publiées</span>
                    <span className="metric-card-val">{globalStats.publishedOffers}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Total Candidatures</span>
                    <span className="metric-card-val">{globalStats.totalApplications}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Signalements en attente</span>
                    <span className="metric-card-val" style={{ color: globalStats.pendingReports > 0 ? '#b42318' : 'var(--color-success)' }}>
                      {globalStats.pendingReports}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions for Admin in Dashboard Overview */}
            {currentRole === 'ADMIN' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '28px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Users size={22} style={{ color: 'var(--color-primary)' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Gestion des Utilisateurs</h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', lineHeight: '1.5', marginBottom: '16px' }}>
                    Visualisez les comptes inscrits, contrôlez leur état d'activation ou suspendez les accès non conformes.
                  </p>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setActiveTab('users')}
                    style={{ fontSize: '0.86rem' }}
                  >
                    Accéder aux utilisateurs ({adminUsers.length}) →
                  </button>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <ShieldCheck size={22} style={{ color: '#b42318' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Modération des Signalements</h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', lineHeight: '1.5', marginBottom: '16px' }}>
                    Traitez les signalements émis par les candidats concernant des offres suspectes ou incomplètes.
                  </p>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setActiveTab('moderation')}
                    style={{ fontSize: '0.86rem' }}
                  >
                    Examiner les signalements ({adminReports.length}) →
                  </button>
                </div>
              </div>
            )}

            {/* Content for Company */}
            {currentRole === 'COMPANY' && (
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Vos offres d'emploi en ligne
                  </h3>
                  {myOffers.length > 0 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setActiveTab('offers')}
                      style={{ fontSize: '0.84rem' }}
                    >
                      Gérer toutes les offres →
                    </button>
                  )}
                </div>
                
                {myOffers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                    <Briefcase size={36} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Vous n'avez pas encore publié d'offre</h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem', marginTop: '4px', marginBottom: '16px' }}>
                      Créez votre première annonce pour commencer à attirer des candidats qualifiés.
                    </p>
                    <button
                      type="button"
                      className="btn-register-pill"
                      onClick={() => {
                        setEditingOffer(null);
                        setIsOfferModalOpen(true);
                      }}
                    >
                      <Plus size={16} />
                      <span>Publier ma première offre</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {myOffers.map(offer => (
                      <div key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{offer.title}</div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                            {offer.location} · {offer.contract_type || offer.contractType} · Statut : <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{offer.status}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                            onClick={() => {
                              setEditingOffer(offer);
                              setIsOfferModalOpen(true);
                            }}
                          >
                            <Edit3 size={14} />
                            <span>Modifier</span>
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '0.82rem', color: 'var(--color-danger)' }}
                            onClick={() => handleDeleteOffer(offer.id)}
                          >
                            <Trash2 size={14} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content for Candidate */}
            {currentRole === 'CANDIDATE' && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Vos candidatures et réponses des recruteurs
                  </h3>
                  <Link to="/offres" className="btn-secondary" style={{ fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Explorer d'autres offres</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <ApplicationsView onStatusChange={refreshData} />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE TAB */}
        {activeTab === 'profile' && (
          <div>
            {currentRole === 'COMPANY' && (
              <CompanyProfileForm
                onProfileUpdated={() => refreshData()}
              />
            )}
            {currentRole === 'CANDIDATE' && (
              <CandidateProfileForm
                onProfileUpdated={() => refreshData()}
              />
            )}
          </div>
        )}

        {/* TAB 3: OFFERS (Company) */}
        {activeTab === 'offers' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>Gestion de vos Annonces d'Emploi</h1>
                <p>Vos offres sont visibles en temps réel par tous les candidats sur le catalogue public.</p>
              </div>
              <button
                type="button"
                className="btn-register-pill"
                onClick={() => {
                  setEditingOffer(null);
                  setIsOfferModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Créer une annonce</span>
              </button>
            </div>

            {myOffers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                <Briefcase size={44} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Aucune offre publiée pour le moment</h3>
                <p style={{ color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: '20px' }}>
                  Publiez votre première offre d'emploi pour commencer à recevoir des candidatures.
                </p>
                <button
                  type="button"
                  className="btn-register-pill"
                  onClick={() => {
                    setEditingOffer(null);
                    setIsOfferModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Créer une annonce d'emploi</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {myOffers.map(offer => (
                  <div key={offer.id} style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{offer.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        {offer.location} · {offer.contract_type || offer.contractType} · Statut : <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{offer.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setEditingOffer(offer);
                          setIsOfferModalOpen(true);
                        }}
                      >
                        <Edit3 size={14} />
                        <span>Modifier</span>
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => handleDeleteOffer(offer.id)}
                      >
                        <Trash2 size={14} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>
                  {currentRole === 'COMPANY' ? "Candidatures reçues pour vos annonces" : "Suivi de vos Candidatures"}
                </h1>
                <p>
                  {currentRole === 'COMPANY' 
                    ? "Examinez les profils des candidats, programmez des visioconférences Google Meet et validez vos recrutements."
                    : "Retrouvez l'état d'avancement de vos dossiers et les liens visio de vos entretiens programmés."}
                </p>
              </div>
            </div>
            <ApplicationsView onStatusChange={refreshData} />
          </div>
        )}

        {/* TAB 5: ADMIN USERS MANAGEMENT */}
        {activeTab === 'users' && currentRole === 'ADMIN' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>Gestion des Utilisateurs & Accès</h1>
                <p>Consultez la liste des comptes enregistrés en base de données, activez ou suspendez les accès.</p>
              </div>
            </div>

            {/* Filter & search bar */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', flex: 1, minWidth: '240px' }}>
                <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom ou email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <select 
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', fontSize: '0.9rem' }}
              >
                <option value="ALL">Tous les rôles</option>
                <option value="CANDIDATE">Candidats</option>
                <option value="COMPANY">Recruteurs (Entreprises)</option>
                <option value="ADMIN">Administrateurs</option>
              </select>
            </div>

            {/* Users table */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fc', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Utilisateur</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Rôle</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Téléphone</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Statut Compte</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          padding: '3px 8px', 
                          borderRadius: '6px',
                          background: user.role === 'ADMIN' ? '#f4ebff' : user.role === 'COMPANY' ? '#eff8ff' : '#ecfdf3',
                          color: user.role === 'ADMIN' ? '#6941c6' : user.role === 'COMPANY' ? '#175cd3' : '#027a48'
                        }}>
                          {user.role}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                        {user.phone || '—'}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: 600, 
                          color: user.accountStatus === 'ACTIVE' ? '#027a48' : '#b42318' 
                        }}>
                          ● {user.accountStatus === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            title={user.accountStatus === 'ACTIVE' ? "Suspendre l'accès" : "Réactiver l'accès"}
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.accountStatus === 'ACTIVE' ? <UserX size={14} style={{ color: '#b42318' }} /> : <UserCheck size={14} style={{ color: '#027a48' }} />}
                            <span>{user.accountStatus === 'ACTIVE' ? "Suspendre" : "Activer"}</span>
                          </button>

                          {user.role !== 'ADMIN' && (
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '5px 8px', fontSize: '0.78rem', color: 'var(--color-danger)' }}
                              title="Supprimer définitivement"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: MODERATION (Admin) */}
        {activeTab === 'moderation' && currentRole === 'ADMIN' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>Signalements & Modération des Offres</h1>
                <p>Examinez les signalements déposés par les utilisateurs de la plateforme.</p>
              </div>
            </div>

            {adminReports.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', padding: '50px 20px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                <CheckCircle2 size={40} style={{ color: 'var(--color-success)', marginBottom: '10px' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Aucun signalement en attente</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem', marginTop: '4px' }}>
                  Toutes les annonces publiées sur JobFlow sont actuellement conformes.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {adminReports.map((report) => (
                  <div key={report.id} style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: report.status === 'PENDING' ? '#fef3f2' : '#ecfdf3', color: report.status === 'PENDING' ? '#b42318' : '#027a48' }}>
                            {report.status === 'PENDING' ? 'À examiner' : report.status}
                          </span>
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)' }}>
                            Signalé le {new Date(report.reportDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '6px' }}>
                          Offre signalée : {report.jobOfferTitle || `Offre #${report.jobOfferId}`}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Entreprise : <strong>{report.companyName || 'NovaTech Solutions'}</strong> · Émis par : {report.userName || 'Utilisateur'} ({report.userEmail || '—'})
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#fafafc', padding: '14px 18px', borderRadius: '10px', borderLeft: '3px solid #f04438', marginBottom: '16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#b42318' }}>
                        Motif : {report.reason}
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                        {report.description || "Aucun commentaire complémentaire fourni."}
                      </p>
                    </div>

                    {report.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.84rem', padding: '7px 16px', color: '#027a48' }}
                          onClick={() => handleResolveReport(report.id, false)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Classer sans suite (Offre valide)</span>
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.84rem', padding: '7px 16px', color: '#b42318', borderColor: '#fecdca', background: '#fffbfa' }}
                          onClick={() => handleResolveReport(report.id, true)}
                        >
                          <Trash2 size={14} />
                          <span>Supprimer l'offre signalée</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>

      {/* Offer Modal Form */}
      {isOfferModalOpen && (
        <JobOfferForm
          initialData={editingOffer}
          onClose={() => setIsOfferModalOpen(false)}
          onSaved={() => {
            refreshData();
            setIsOfferModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
