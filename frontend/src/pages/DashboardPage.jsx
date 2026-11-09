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
  ArrowRight
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
  const [globalStats, setGlobalStats] = useState({ users: 0, offers: 0, companies: 0 });

  const refreshData = () => {
    if (!currentUser) return;
    
    if (currentRole === 'COMPANY') {
      const offers = db.getJobOffersForCompany(currentUser);
      const apps = db.getApplicationsForCompany(currentUser);
      setMyOffers(offers);
      setMyApplications(apps);
    } else if (currentRole === 'CANDIDATE') {
      const apps = db.getApplicationsForCandidate(currentUser);
      const prof = db.getCandidateProfileByUser(currentUser);
      setMyApplications(apps);
      setCandidateProfile(prof);
    } else if (currentRole === 'ADMIN') {
      setGlobalStats({
        users: db.getUsers().length,
        offers: db.getJobOffers().length,
        companies: db.getCompanyProfiles().length
      });
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

  const handleDeleteOffer = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre d'emploi ?")) {
      db.deleteJobOffer(id);
      refreshData();
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
                    <span className="metric-card-title">Utilisateurs inscrits</span>
                    <span className="metric-card-val">{globalStats.users}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Total Offres d'emploi</span>
                    <span className="metric-card-val">{globalStats.offers}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Total Entreprises</span>
                    <span className="metric-card-val">{globalStats.companies}</span>
                  </div>
                </>
              )}
            </div>

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
                            {offer.location} · {offer.contract_type} · Statut : <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{offer.status}</span>
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
                        {offer.location} · {offer.contract_type} · Salaire: {offer.salary_min}€ - {offer.salary_max}€
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
                <p>Signalements déposés par les utilisateurs nécessitant un examen.</p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--color-warning-bg)', borderRadius: '10px', border: '1px solid #fedf89' }}>
                <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
                <div>
                  <strong>Signalement sur l'offre #3 (Ingénieur Logiciel Fullstack)</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Motif : Information de salaire à préciser · Statut : En cours d'examen
                  </div>
                </div>
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
