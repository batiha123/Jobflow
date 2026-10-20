import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { JobCard } from '../components/JobCard/JobCard';
import { JobDetailModal } from '../components/JobDetailModal/JobDetailModal';
import { useToast } from '../components/Toast/Toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../data/dbStore';
import { api } from '../services/api';
import { Search, MapPin, Filter, X, CheckCircle2, RotateCcw, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import './JobsPage.css';

export function JobsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();

  const [offers, setOffers] = useState([]);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [contractFilter, setContractFilter] = useState('ALL');
  
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState(null);
  const [applyModalOffer, setApplyModalOffer] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const liveOffers = await api.jobs.getAll();
        if (Array.isArray(liveOffers) && liveOffers.length > 0) {
          setOffers(liveOffers);
        } else {
          setOffers(db.getJobOffers());
        }
      } catch (err) {
        setOffers(db.getJobOffers());
      }
    };
    loadOffers();
  }, []);

  const filteredOffers = offers.filter((offer) => {
    const matchKeyword = !keyword || 
      (offer.title && offer.title.toLowerCase().includes(keyword.toLowerCase())) ||
      (offer.description && offer.description.toLowerCase().includes(keyword.toLowerCase()));
    const matchLocation = !location || 
      (offer.location && offer.location.toLowerCase().includes(location.toLowerCase()));
    const matchContract = contractFilter === 'ALL' || offer.contract_type === contractFilter || offer.contractType === contractFilter;
    return matchKeyword && matchLocation && matchContract;
  });

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setContractFilter('ALL');
  };

  const handleOpenApply = async (offer) => {
    if (!currentUser) {
      toast.error("Veuillez vous connecter avec votre compte candidat pour postuler.");
      return;
    }

    if (currentUser.role === 'COMPANY') {
      toast.error("Vous êtes connecté en tant qu'entreprise. Utilisez un compte candidat pour postuler.");
      return;
    }

    setApplyModalOffer(offer);
    setAppliedSuccess(false);
    setApplyError(null);
    setMotivation('');

    try {
      const prof = await api.candidates.getProfile(currentUser.id);
      setCandidateProfile(prof);
    } catch (err) {
      setCandidateProfile(db.getCandidateProfileByUser(currentUser));
    }
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!applyModalOffer || !currentUser) return;

    setIsApplying(true);
    setApplyError(null);

    const cvUrlToUse = candidateProfile?.cv_url || 'https://jobflow.com/resumes/candidat_cv.pdf';

    try {
      // 1. Submit to real Spring Boot backend
      await api.applications.apply({
        userId: currentUser.id,
        jobOfferId: applyModalOffer.id,
        motivationMessage: motivation,
        cvUrl: cvUrlToUse
      });

      // 2. Also sync local dbStore
      db.submitApplication({
        candidate: currentUser,
        candidate_id: currentUser.id,
        candidate_email: currentUser.email,
        candidate_name: currentUser.name,
        job_offer_id: applyModalOffer.id,
        motivation_message: motivation,
        cv_url: cvUrlToUse
      });

      setAppliedSuccess(true);
      toast.success("🎉 Candidature soumise avec succès !");

      setTimeout(() => {
        setApplyModalOffer(null);
        setAppliedSuccess(false);
        navigate('/tableau-de-bord');
      }, 1500);
    } catch (err) {
      console.error("Erreur candidature:", err);
      const errMsg = err.message || "Erreur lors de l'envoi de la candidature.";
      setApplyError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div>
      <Navbar />

      <header className="jobs-page-header">
        <div className="container">
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
            Catalogue des Offres d'Emploi
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Trouvez les meilleures opportunités conformes à vos aspirations et compétences.
          </p>

          <div className="jobs-search-bar-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Poste, mots-clés, technologie..."
                className="jobs-search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Ville ou région..."
                className="jobs-search-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <select 
              className="jobs-filter-select"
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
            >
              <option value="ALL">Tous les contrats</option>
              <option value="FULL_TIME">CDI / Temps plein</option>
              <option value="PART_TIME">Temps partiel</option>
              <option value="INTERNSHIP">Stage</option>
              <option value="CONTRACT">Freelance / Contrat</option>
              <option value="TEMPORARY">Intérim</option>
            </select>

            {(keyword || location || contractFilter !== 'ALL') && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleResetFilters}
              >
                <RotateCcw size={14} />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container jobs-layout-grid">
        {/* Sidebar Filters */}
        <aside className="jobs-sidebar-filters">
          <div>
            <h4 className="filter-section-title">Type de contrat</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { val: 'ALL', label: 'Tous les types' },
                { val: 'FULL_TIME', label: 'CDI (Temps plein)' },
                { val: 'INTERNSHIP', label: 'Stage' },
                { val: 'CONTRACT', label: 'Freelance / Indépendant' },
                { val: 'PART_TIME', label: 'Temps partiel' }
              ].map(opt => (
                <label key={opt.val} className="filter-checkbox-item">
                  <input 
                    type="radio" 
                    name="contractFilter" 
                    checked={contractFilter === opt.val}
                    onChange={() => setContractFilter(opt.val)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-alt)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>Conseil candidat</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', lineHeight: '1.5' }}>
              Complétez votre profil avec vos compétences techniques pour être directement recommandé auprès des recruteurs partenaires.
            </p>
          </div>
        </aside>

        {/* Offers Grid */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {filteredOffers.length} offre(s) trouvée(s)
            </span>
          </div>

          {filteredOffers.length === 0 ? (
            <div style={{ background: 'var(--bg-surface)', padding: '48px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
              <h3>Aucune offre ne correspond à vos critères.</h3>
              <p style={{ color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Essayez d'élargir votre recherche ou de réinitialiser les filtres.
              </p>
              <button 
                type="button" 
                className="btn-register-pill" 
                style={{ marginTop: '16px' }}
                onClick={handleResetFilters}
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredOffers.map((offer) => (
                <JobCard 
                  key={offer.id} 
                  offer={offer} 
                  onApply={(off) => handleOpenApply(off)}
                  onViewDetails={(off) => setSelectedOfferForDetail(off)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Job Details Modal */}
      {selectedOfferForDetail && (
        <JobDetailModal
          offer={selectedOfferForDetail}
          onClose={() => setSelectedOfferForDetail(null)}
          onApply={(off) => {
            setSelectedOfferForDetail(null);
            handleOpenApply(off);
          }}
        />
      )}

      {/* Application Modal */}
      {applyModalOffer && (
        <div className="modal-backdrop">
          <div className="job-offer-modal-card">
            <div className="modal-header-row">
              <div>
                <h3 className="modal-title">Postuler à {applyModalOffer.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {applyModalOffer.companyName || applyModalOffer.company_name} · {applyModalOffer.location}
                </p>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={() => setApplyModalOffer(null)}
              >
                <X size={20} />
              </button>
            </div>

            {appliedSuccess ? (
              <div className="save-success-banner" style={{ padding: '24px', textAlign: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
                <span>Votre candidature a été transmise avec succès ! Redirection vers votre tableau de bord...</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmApply}>
                {applyError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fef3f2', border: '1px solid #fecdca', borderRadius: '8px', color: '#b42318', fontSize: '0.88rem', marginBottom: '16px' }}>
                    <AlertCircle size={18} />
                    <span>{applyError}</span>
                  </div>
                )}

                <div className="form-group full-width">
                  <label className="form-label">
                    <span>Message de motivation au recruteur</span>
                  </label>
                  <textarea 
                    className="form-textarea"
                    required
                    rows={4}
                    placeholder="Expliquez pourquoi vous êtes le candidat idéal pour cette opportunité..."
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                  />
                </div>

                <div style={{ background: '#f8f9fc', border: '1px solid var(--border-default)', padding: '14px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    <FileText size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Curriculum Vitae (CV)</span>
                  </div>
                  {candidateProfile?.cv_url ? (
                    <div style={{ color: '#027a48', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} />
                      <span>{candidateProfile.cv_filename || "Mon_CV_Candidat.pdf"} (Votre CV enregistré sera automatiquement transmis)</span>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      Aucun CV spécifique n'est encore enregistré sur votre profil. Un CV par défaut sera joint. Vous pourrez le modifier à tout moment dans votre espace profil.
                    </div>
                  )}
                </div>

                <div className="form-actions-footer">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setApplyModalOffer(null)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary-save" disabled={isApplying}>
                    <span>{isApplying ? "Envoi en cours..." : "Envoyer ma candidature"}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}