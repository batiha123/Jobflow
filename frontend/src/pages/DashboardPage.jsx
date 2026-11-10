import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { CompanyProfileForm } from '../components/CompanyProfile/CompanyProfileForm';
import { CandidateProfileForm } from '../components/CandidateProfile/CandidateProfileForm';
import { JobOfferForm } from '../components/JobOfferModal/JobOfferForm';
import { ApplicationsView } from '../components/Applications/ApplicationsView';
import { AuthModal } from '../components/AuthModal/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast/Toast';
import { db } from '../data/dbStore';
import api, {
  approveJobOffer,
  closeMyJobOffer,
  deleteMyJobOffer,
  getMyJobOffers,
  getPendingJobOffers,
  rejectJobOffer,
  submitMyJobOffer
} from '../services/api';
import { 
  Briefcase, 
  FileCheck2, 
  Plus, 
  Trash2, 
  Edit3, 
  LogIn,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Send
} from 'lucide-react';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const currentRole = currentUser?.role || 'CANDIDATE';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // User-scoped data
  const [myOffers, setMyOffers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);

  // Person 4: Admin Live Backend Data
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeJobOffers: 0,
    totalApplications: 0,
    pendingReports: 0
  });
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filterReportStatus, setFilterReportStatus] = useState('');

  // Person 4: Google Gemini AI State
  const [aiCandidateSkills, setAiCandidateSkills] = useState('Java 21, Spring Boot, MySQL, REST APIs, Git, Docker');
  const [aiJobRequirements, setAiJobRequirements] = useState('Ingénieur Backend Java: 2+ ans avec Java, Spring Boot, architecture microservices, bases de données relationnelles, CI/CD, Kubernetes');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Person 2: Company Offer States & Filters
  const [offerFilters, setOfferFilters] = useState({
    title: '',
    location: '',
    contractType: '',
    status: ''
  });
  const [offerPage, setOfferPage] = useState(0);
  const [offerPageCount, setOfferPageCount] = useState(0);
  const [totalMyOffers, setTotalMyOffers] = useState(0);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState('');
  const [pendingOffers, setPendingOffers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [actingOfferId, setActingOfferId] = useState(null);

  const loadCompanyOffers = useCallback(async () => {
    setOffersLoading(true);
    setOffersError('');
    try {
      const result = await getMyJobOffers({
        ...offerFilters,
        contractType: offerFilters.contractType || undefined,
        status: offerFilters.status || undefined,
        page: offerPage,
        size: 10
      });
      setMyOffers(Array.isArray(result) ? result : result?.content || []);
      setOfferPageCount(Array.isArray(result) ? 1 : result?.totalPages || 0);
      setTotalMyOffers(Array.isArray(result) ? result.length : result?.totalElements || 0);
    } catch (requestError) {
      setOffersError(requestError.message || 'Impossible de charger vos offres.');
      setMyOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, [offerFilters, offerPage]);

  const loadPendingOffers = useCallback(async () => {
    setPendingLoading(true);
    setPendingError('');
    try {
      const result = await getPendingJobOffers({ page: 0, size: 100 });
      setPendingOffers(Array.isArray(result) ? result : result?.content || []);
    } catch (requestError) {
      setPendingError(requestError.message || 'Impossible de charger les offres en attente.');
      setPendingOffers([]);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!currentUser) return;

    if (currentRole === 'COMPANY') {
      const apps = db.getApplicationsForCompany(currentUser);
      setMyApplications(apps);
      await loadCompanyOffers();
    } else if (currentRole === 'CANDIDATE') {
      const apps = db.getApplicationsForCandidate(currentUser);
      const prof = db.getCandidateProfileByUser(currentUser);
      setMyApplications(apps);
      setCandidateProfile(prof);
    } else if (currentRole === 'ADMIN') {
      try {
        const stats = await api.admin.getStats();
        setAdminStats(stats);
        const liveReports = await api.reports.getAll();
        setReports(liveReports);
        const liveLogs = await api.admin.getAuditLogs();
        setAuditLogs(liveLogs);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
      await loadPendingOffers();
    }
  }, [currentUser, currentRole, loadCompanyOffers, loadPendingOffers]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Moderation: Update report status
  const handleUpdateReportStatus = async (reportId, newStatus) => {
    await api.reports.updateStatus(reportId, newStatus);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    // Log admin action
    if (currentUser?.id) {
      await api.admin.logAction({
        adminUserId: currentUser.id,
        action: `REPORT_${newStatus}`,
        targetType: 'JOB_OFFER_REPORT',
        targetId: reportId,
        details: `Statut du rapport #${reportId} changé vers ${newStatus}`
      });
      const liveLogs = await api.admin.getAuditLogs();
      setAuditLogs(liveLogs);
    }
  };

  // Run AI Analysis via Google Gemini
  const handleRunAiAnalysis = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const result = await api.ai.analyzeCv(aiCandidateSkills, aiJobRequirements);
      setAiResult(result);
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

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

  const handleOfferAction = async (action, offer) => {
    if (action === 'delete' && !window.confirm('Confirmer la suppression de cette offre ?')) {
      return;
    }

    setActingOfferId(offer.id);
    try {
      if (action === 'delete') await deleteMyJobOffer(offer.id);
      if (action === 'submit') await submitMyJobOffer(offer.id);
      if (action === 'close') await closeMyJobOffer(offer.id);
      if (action === 'approve') await approveJobOffer(offer.id);
      if (action === 'reject') await rejectJobOffer(offer.id);
      toast.success(action === 'delete' ? 'Offre supprimée.' : 'Statut de l’offre mis à jour.');
      await refreshData();
    } catch (requestError) {
      toast.error(requestError.message || 'Impossible de traiter cette offre.');
    } finally {
      setActingOfferId(null);
    }
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

  const candidateInterviewsCount = myApplications.filter(a => a.interview && a.interview.scheduled_at).length;
  const companyInterviewsCount = myApplications.filter(a => a.interview && a.interview.scheduled_at).length;
  const candidateCompleteness = computeProfileCompleteness(candidateProfile);
  const canDeleteOffer = offer => ['DRAFT', 'REJECTED', 'CLOSED'].includes(offer.status);

  const renderCompanyOffer = offer => (
    <div key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{offer.title}</div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
          {offer.location || 'Localisation non précisée'} · {offer.contractType} · Statut : <strong>{offer.status}</strong>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {offer.status === 'DRAFT' && (
          <>
            <button type="button" className="btn-secondary" disabled={actingOfferId === offer.id} onClick={() => {
              setEditingOffer(offer);
              setIsOfferModalOpen(true);
            }}>
              <Edit3 size={14} />
              <span>Modifier</span>
            </button>
            <button type="button" className="btn-secondary" disabled={actingOfferId === offer.id} onClick={() => handleOfferAction('submit', offer)}>
              <FileCheck2 size={14} />
              <span>Soumettre</span>
            </button>
          </>
        )}
        {offer.status === 'PUBLISHED' && (
          <button type="button" className="btn-secondary" disabled={actingOfferId === offer.id} onClick={() => handleOfferAction('close', offer)}>
            <span>Clôturer</span>
          </button>
        )}
        {canDeleteOffer(offer) && (
          <button
            type="button"
            className="btn-secondary"
            disabled={actingOfferId === offer.id}
            style={{ color: 'var(--color-danger)' }}
            onClick={() => handleOfferAction('delete', offer)}
          >
            <Trash2 size={14} />
            <span>{actingOfferId === offer.id ? 'En cours…' : 'Supprimer'}</span>
          </button>
        )}
      </div>
    </div>
  );

  const filteredReports = filterReportStatus 
    ? reports.filter(r => r.status === filterReportStatus)
    : reports;

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
                  {currentRole === 'ADMIN' && "Espace Administration & Supervision"}
                </h1>
                <p>
                  {currentRole === 'COMPANY' && "Gérez vos recrutements, vos annonces actives et consultez les candidatures reçues."}
                  {currentRole === 'CANDIDATE' && "Suivez vos candidatures en direct, préparez vos entretiens et mettez à jour votre CV."}
                  {currentRole === 'ADMIN' && "Métriques en direct, journal des audits de sécurité et supervision globale."}
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
                    <span className="metric-card-val">{totalMyOffers}</span>
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
                    <span className="metric-card-title">Candidatures envoyées</span>
                    <span className="metric-card-val">{myApplications.length}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Entretiens confirmés</span>
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

              {/* Real Live Spring Boot Metrics for Admin (Person 4) */}
              {currentRole === 'ADMIN' && (
                <>
                  <div className="metric-card">
                    <span className="metric-card-title">Utilisateurs inscrits</span>
                    <span className="metric-card-val">{adminStats.totalUsers}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Offres actives</span>
                    <span className="metric-card-val">{adminStats.activeJobOffers}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Candidatures totales</span>
                    <span className="metric-card-val">{adminStats.totalApplications}</span>
                  </div>
                  <div className="metric-card" style={{ borderColor: adminStats.pendingReports > 0 ? '#fca5a5' : undefined }}>
                    <span className="metric-card-title">Signalements en attente</span>
                    <span className="metric-card-val" style={{ color: adminStats.pendingReports > 0 ? '#dc2626' : undefined }}>
                      {adminStats.pendingReports}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Admin Audit Trail Table (Person 4) */}
            {currentRole === 'ADMIN' && (
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)', marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={20} style={{ color: 'var(--color-primary)' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                      Journal des Actions d'Administration (Audit Logs)
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {auditLogs.length} action{auditLogs.length > 1 ? 's' : ''} enregistrée{auditLogs.length > 1 ? 's' : ''}
                  </span>
                </div>

                {auditLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Aucun log d'action pour le moment. Les actions d'administration seront tracées ici automatiquement.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '10px' }}>Date</th>
                          <th style={{ padding: '10px' }}>Admin ID</th>
                          <th style={{ padding: '10px' }}>Action</th>
                          <th style={{ padding: '10px' }}>Cible</th>
                          <th style={{ padding: '10px' }}>Détails</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : 'N/A'}
                            </td>
                            <td style={{ padding: '10px', fontWeight: 600 }}>#{log.adminUserId}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>{log.targetType} #{log.targetId}</td>
                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Content for Company */}
            {currentRole === 'COMPANY' && (
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Vos offres d'emploi
                  </h3>
                  {totalMyOffers > 0 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setActiveTab('offers')}
                      style={{ fontSize: '0.84rem' }}
                    >
                      Voir toutes les offres ({myOffers.length})
                    </button>
                  )}
                </div>
                
                {offersError && (
                  <div role="alert" className="dashboard-error-message">
                    <span>{offersError}</span>
                    <button type="button" className="btn-secondary" onClick={refreshData}>Réessayer</button>
                  </div>
                )}
                {offersLoading ? (
                  <p role="status">Chargement de vos offres…</p>
                ) : myOffers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                    <Briefcase size={36} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Vous n'avez pas encore publié d'offre</h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem', marginTop: '4px', marginBottom: '16px' }}>
                      Créez une offre en brouillon, puis soumettez-la pour validation.
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
                    {myOffers.slice(0, 5).map(renderCompanyOffer)}
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
                <p>Gérez vos brouillons, soumettez-les pour validation et suivez leur statut.</p>
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
                <span>Publier une offre</span>
              </button>
            </div>

            <div className="dashboard-offer-filters">
              <input
                className="form-input"
                aria-label="Filtrer par titre"
                placeholder="Titre"
                value={offerFilters.title}
                onChange={event => {
                  setOfferFilters(previous => ({ ...previous, title: event.target.value }));
                  setOfferPage(0);
                }}
              />
              <input
                className="form-input"
                aria-label="Filtrer par localisation"
                placeholder="Localisation"
                value={offerFilters.location}
                onChange={event => {
                  setOfferFilters(previous => ({ ...previous, location: event.target.value }));
                  setOfferPage(0);
                }}
              />
              <select
                className="form-input"
                aria-label="Filtrer par type de contrat"
                value={offerFilters.contractType}
                onChange={event => {
                  setOfferFilters(previous => ({ ...previous, contractType: event.target.value }));
                  setOfferPage(0);
                }}
              >
                <option value="">Tous les contrats</option>
                <option value="FULL_TIME">CDI / Temps plein</option>
                <option value="PART_TIME">Temps partiel</option>
                <option value="INTERNSHIP">Stage</option>
                <option value="CONTRACT">Freelance / Contrat</option>
                <option value="TEMPORARY">CDD / Intérim</option>
              </select>
              <select
                className="form-input"
                aria-label="Filtrer par statut"
                value={offerFilters.status}
                onChange={event => {
                  setOfferFilters(previous => ({ ...previous, status: event.target.value }));
                  setOfferPage(0);
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="DRAFT">Brouillon</option>
                <option value="PENDING">En attente</option>
                <option value="PUBLISHED">Publiée</option>
                <option value="REJECTED">Refusée</option>
                <option value="CLOSED">Clôturée</option>
              </select>
            </div>

            {offersError && (
              <div role="alert" className="dashboard-error-message">
                <span>{offersError}</span>
                <button type="button" className="btn-secondary" onClick={refreshData}>Réessayer</button>
              </div>
            )}
            {offersLoading ? (
              <p role="status">Chargement de vos offres…</p>
            ) : myOffers.length === 0 ? (
              <div className="dashboard-empty-state">
                <Briefcase size={40} />
                <h3>Aucune offre ne correspond à ces filtres.</h3>
                <p>Créez une offre en brouillon ou ajustez votre recherche.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {myOffers.map(renderCompanyOffer)}
              </div>
            )}

            {offerPageCount > 1 && (
              <div className="dashboard-pagination">
                <button type="button" className="btn-secondary" disabled={offerPage === 0} onClick={() => setOfferPage(page => page - 1)}>
                  Page précédente
                </button>
                <span>Page {offerPage + 1} sur {offerPageCount} · {totalMyOffers} offre(s)</span>
                <button type="button" className="btn-secondary" disabled={offerPage + 1 >= offerPageCount} onClick={() => setOfferPage(page => page + 1)}>
                  Page suivante
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>Suivi des Candidatures & Entretiens</h1>
                <p>Retrouvez l'état d'avancement de vos dossiers et les liens visio de vos entretiens programmés.</p>
              </div>
            </div>
            <ApplicationsView onStatusChange={refreshData} />
          </div>
        )}

        {/* TAB 5: MODERATION (Person 2 Pending Offers + Person 4 Reports Moderation) */}
        {activeTab === 'moderation' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>Modération & Supervision de la Plateforme</h1>
                <p>Approuvez les offres soumises et examinez les signalements déposés par les utilisateurs.</p>
              </div>
            </div>

            {/* SECTION 1: OFFRES D'EMPLOI EN ATTENTE (Person 2) */}
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px' }}>
                Offres d'emploi en attente de validation ({pendingOffers.length})
              </h2>

              {pendingError && (
                <div role="alert" className="dashboard-error-message" style={{ marginBottom: '14px' }}>
                  <span>{pendingError}</span>
                  <button type="button" className="btn-secondary" onClick={refreshData}>Réessayer</button>
                </div>
              )}
              {pendingLoading ? (
                <p role="status">Chargement des offres en attente…</p>
              ) : pendingOffers.length === 0 ? (
                <div className="dashboard-empty-state" style={{ marginBottom: '24px' }}>
                  <h3>Aucune offre en attente d'approbation.</h3>
                  <p>Toutes les annonces soumises ont été traitées.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  {pendingOffers.map(offer => (
                    <div key={offer.id} className="dashboard-pending-offer">
                      <div>
                        <h3>{offer.title}</h3>
                        <p>{offer.companyName} · {offer.location || 'Localisation non précisée'} · {offer.contractType}</p>
                        <p>{offer.description}</p>
                      </div>
                      <div className="dashboard-pending-actions">
                        <button type="button" className="btn-primary-save" disabled={actingOfferId === offer.id} onClick={() => handleOfferAction('approve', offer)}>
                          Approuver
                        </button>
                        <button type="button" className="btn-secondary" disabled={actingOfferId === offer.id} onClick={() => handleOfferAction('reject', offer)}>
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: SIGNALEMENTS DES UTILISATEURS (Person 4) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Signalements utilisateurs
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${filterReportStatus === '' ? 'active' : ''}`}
                    onClick={() => setFilterReportStatus('')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    Tous ({reports.length})
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${filterReportStatus === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setFilterReportStatus('PENDING')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', color: '#b45309' }}
                  >
                    En attente ({reports.filter(r => r.status === 'PENDING').length})
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${filterReportStatus === 'REVIEWED' ? 'active' : ''}`}
                    onClick={() => setFilterReportStatus('REVIEWED')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', color: '#15803d' }}
                  >
                    Examinés ({reports.filter(r => r.status === 'REVIEWED').length})
                  </button>
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div style={{ background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-default)' }}>
                  <ShieldCheck size={36} style={{ color: '#16a34a', margin: '0 auto 12px auto' }} />
                  <h3>Aucun signalement trouvé</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    La plateforme est saine. Aucun rapport ne correspond au filtre sélectionné.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      style={{
                        background: 'var(--bg-surface)',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: report.status === 'PENDING' ? '#fef3c7' : (report.status === 'REVIEWED' ? '#dcfce7' : '#f1f5f9'),
                            color: report.status === 'PENDING' ? '#b45309' : (report.status === 'REVIEWED' ? '#15803d' : '#64748b')
                          }}>
                            {report.status}
                          </span>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            Signalement #{report.id} sur l'Offre #{report.jobOfferId}
                          </strong>
                        </div>

                        <p style={{ margin: '0 0 6px 0', fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                          Motif : {report.reason}
                        </p>
                        {report.description && (
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b' }}>
                            Détails : {report.description}
                          </p>
                        )}

                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Signalé par utilisateur #{report.userId} · Date : {report.reportDate ? new Date(report.reportDate).toLocaleString('fr-FR') : 'N/A'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {report.status !== 'REVIEWED' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#16a34a' }}
                            onClick={() => handleUpdateReportStatus(report.id, 'REVIEWED')}
                          >
                            <CheckCircle size={14} />
                            <span>Valider / Traiter</span>
                          </button>
                        )}
                        {report.status !== 'DISMISSED' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#64748b' }}
                            onClick={() => handleUpdateReportStatus(report.id, 'DISMISSED')}
                          >
                            <XCircle size={14} />
                            <span>Ignorer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: GOOGLE GEMINI AI MATCHER (Person 4) */}
        {activeTab === 'ai-matcher' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                  <h1 style={{ margin: 0 }}>Analyseur de CV par IA (Google Gemini 1.5 Flash)</h1>
                </div>
                <p>
                  Testez en direct l'intégration de l'IA Google Gemini pour calculer l'adéquation candidat / offre d'emploi.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Form Input */}
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                  Données d'évaluation
                </h3>

                <form onSubmit={handleRunAiAnalysis}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Compétences & Profil du Candidat :
                    </label>
                    <textarea
                      rows={4}
                      value={aiCandidateSkills}
                      onChange={(e) => setAiCandidateSkills(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.88rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Exigences & Compétences requises par l'offre :
                    </label>
                    <textarea
                      rows={4}
                      value={aiJobRequirements}
                      onChange={(e) => setAiJobRequirements(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.88rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="btn-register-pill"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      padding: '12px',
                      cursor: aiLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{aiLoading ? "Analyse en cours avec Gemini..." : "Lancer l'analyse avec Google Gemini"}</span>
                  </button>
                </form>
              </div>

              {/* AI Result Card */}
              <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                  Résultat de l'analyse IA
                </h3>

                {aiLoading ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                    <Sparkles size={40} className="animate-spin" style={{ animation: 'spin 2s linear infinite', marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600 }}>Google Gemini examine les compétences...</p>
                  </div>
                ) : aiResult ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Score header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Score de correspondance</span>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: aiResult.matchScore >= 70 ? '#16a34a' : (aiResult.matchScore >= 50 ? '#d97706' : '#dc2626') }}>
                          {aiResult.matchScore}%
                        </div>
                      </div>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        background: aiResult.matchLevel === 'STRONG' ? '#dcfce7' : (aiResult.matchLevel === 'MODERATE' ? '#fef3c7' : '#fee2e2'),
                        color: aiResult.matchLevel === 'STRONG' ? '#15803d' : (aiResult.matchLevel === 'MODERATE' ? '#b45309' : '#b91c1c')
                      }}>
                        {aiResult.matchLevel} MATCH
                      </span>
                    </div>

                    {/* Matched skills */}
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '6px' }}>
                        ✓ Compétences validées :
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {aiResult.matchedSkills?.map((s, idx) => (
                          <span key={idx} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing skills */}
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', display: 'block', marginBottom: '6px' }}>
                        ✗ Compétences à approfondir :
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {aiResult.missingSkills && aiResult.missingSkills.length > 0 ? (
                          aiResult.missingSkills.map((s, idx) => (
                            <span key={idx} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: '#fee2e2', color: '#b91c1c' }}>
                              {s}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Aucune compétence manquante détectée.</span>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div style={{ marginTop: 'auto', padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', fontStyle: 'italic' }}>
                      "{aiResult.summary}"
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '40px' }}>
                    Cliquez sur "Lancer l'analyse avec Google Gemini" pour voir le score et l'analyse détaillée en direct.
                  </div>
                )}
              </div>
            </div>
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
