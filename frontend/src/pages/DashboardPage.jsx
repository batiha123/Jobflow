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
import {
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
  ArrowRight
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
  const [globalStats] = useState({ users: null, offers: null, companies: null });
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
      await loadPendingOffers();
    }
  }, [currentUser, currentRole, loadCompanyOffers, loadPendingOffers]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
                  {currentRole === 'ADMIN' && "Espace Administration"}
                </h1>
                <p>
                  {currentRole === 'COMPANY' && "Gérez vos recrutements, vos annonces actives et consultez les candidatures reçues."}
                  {currentRole === 'CANDIDATE' && "Suivez vos candidatures en direct, préparez vos entretiens et mettez à jour votre CV."}
                  {currentRole === 'ADMIN' && "Contrôle global de la plateforme, gestion des utilisateurs et modération des annonces."}
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
                    <span className="metric-card-title">Utilisateurs inscrits</span>
                    <span className="metric-card-val">{globalStats.users ?? '—'}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Total Offres d'emploi</span>
                    <span className="metric-card-val">{globalStats.offers ?? '—'}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Total Entreprises</span>
                    <span className="metric-card-val">{globalStats.companies ?? '—'}</span>
                  </div>
                </>
              )}
            </div>

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
                      Gérer toutes les offres →
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
                <span>Créer une annonce</span>
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

        {/* TAB 5: MODERATION (Admin) */}
        {activeTab === 'moderation' && (
          <div>
            <div className="dashboard-page-header">
              <div>
                <h1>Modération des Annonces</h1>
                <p>Examinez les offres soumises. L’API vérifie le rôle administrateur pour chaque action.</p>
              </div>
            </div>

            {pendingError && (
              <div role="alert" className="dashboard-error-message">
                <span>{pendingError}</span>
                <button type="button" className="btn-secondary" onClick={refreshData}>Réessayer</button>
              </div>
            )}
            {pendingLoading ? (
              <p role="status">Chargement des offres en attente…</p>
            ) : pendingOffers.length === 0 ? (
              <div className="dashboard-empty-state">
                <h3>Aucune offre en attente.</h3>
                <p>Si l’accès est refusé, Personna 1 doit fournir le JWT et l’autorité ROLE_ADMIN.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
