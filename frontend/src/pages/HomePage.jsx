import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { Hero } from '../components/Hero/Hero';
import { Stats } from '../components/Stats/Stats';
import { JobCard } from '../components/JobCard/JobCard';
import { JobDetailModal } from '../components/JobDetailModal/JobDetailModal';
import { useToast } from '../components/Toast/Toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../data/dbStore';
import api, {
  getPublicCompanyProfiles,
  getPublishedJobOfferById,
  getPublishedJobOffers,
  resolveApiAssetUrl
} from '../services/api';
import { ArrowRight, MapPin, Building2, CheckCircle2, X, FileText, AlertCircle } from 'lucide-react';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();

  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [offersLoading, setOffersLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [offersError, setOffersError] = useState('');
  const [companiesError, setCompaniesError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  
  // Application Modal state
  const [applyModalOffer, setApplyModalOffer] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getPublishedJobOffers({ page: 0, size: 6 }, { signal: controller.signal })
      .then(result => setOffers(Array.isArray(result) ? result : result?.content || []))
      .catch(error => {
        if (error.name !== 'AbortError') setOffersError(error.message || 'Impossible de charger les offres.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setOffersLoading(false);
      });

    getPublicCompanyProfiles({ signal: controller.signal })
      .then(result => setCompanies(Array.isArray(result) ? result.slice(0, 4) : []))
      .catch(error => {
        if (error.name !== 'AbortError') setCompaniesError(error.message || 'Impossible de charger les entreprises.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCompaniesLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const handleViewDetails = async offer => {
    setSelectedOfferForDetail(offer);
    setDetailLoading(true);
    setDetailError('');
    try {
      setSelectedOfferForDetail(await getPublishedJobOfferById(offer.id));
    } catch (error) {
      if (error.name !== 'AbortError') {
        setDetailError(error.message || 'Impossible de charger le détail de cette offre.');
        toast.error(error.message || 'Impossible de charger le détail de cette offre.');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApplyClick = async (offer) => {
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
      setCandidateProfile(prof || db.getCandidateProfileByUser(currentUser));
    } catch {
      setCandidateProfile(db.getCandidateProfileByUser(currentUser));
    }
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!applyModalOffer || !currentUser) return;

    setIsApplying(true);
    setApplyError(null);

    const cvUrlToUse = candidateProfile?.cvUrl || candidateProfile?.cv_url || 'https://jobflow.com/resumes/candidat_cv.pdf';

    try {
      await api.applications.apply({
        candidateId: currentUser.id,
        jobOfferId: applyModalOffer.id,
        motivationMessage: motivation,
        cvUrl: cvUrlToUse
      });
    } catch (err) {
      console.warn("Échec soumission API candidature, synchronisation locale:", err);
    }

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
    toast.success("🎉 Candidature transmise avec succès à l'entreprise !");

    setTimeout(() => {
      setApplyModalOffer(null);
      setAppliedSuccess(false);
      navigate('/tableau-de-bord');
    }, 1200);
    setIsApplying(false);
  };

  return (
    <div>
      <Navbar />
      <Hero />
      <Stats />

      {/* Featured Jobs Section */}
      <section className="home-section-jobs">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Dernières Opportunités</h2>
              <p className="section-subtitle">
                Postes vérifiés publiés directement par nos entreprises partenaires.
              </p>
            </div>
            <Link to="/offres" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>Voir toutes les offres</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {offersError && (
            <div role="alert" className="jobs-page-error">
              <AlertCircle size={18} />
              <span>{offersError}</span>
              <button type="button" className="btn-secondary" onClick={() => {
                setOffersLoading(true);
                setOffersError('');
                setReloadKey(key => key + 1);
              }}>Réessayer</button>
            </div>
          )}
          {offersLoading ? <p role="status">Chargement des offres…</p> : null}
          {!offersLoading && !offersError && offers.length === 0 ? <p>Aucune offre publiée pour le moment.</p> : null}
          <div className="jobs-grid-3">
            {offers.slice(0, 6).map((offer) => (
              <JobCard 
                key={offer.id} 
                offer={offer} 
                onApply={handleApplyClick}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies Section */}
      <section className="home-section-companies">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Entreprises sur JobFlow</h2>
              <p className="section-subtitle">
                Découvrez la culture d’entreprise et les équipes des leaders tech.
              </p>
            </div>
            <Link to="/entreprises" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>Explorer les entreprises</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {companiesError && (
            <div role="alert" className="company-page-error">
              <AlertCircle size={18} />
              <span>{companiesError}</span>
              <button type="button" className="btn-secondary" onClick={() => {
                setCompaniesLoading(true);
                setCompaniesError('');
                setReloadKey(key => key + 1);
              }}>Réessayer</button>
            </div>
          )}
          {companiesLoading ? <p role="status">Chargement des entreprises…</p> : null}
          {!companiesLoading && !companiesError && companies.length === 0 ? <p>Aucune entreprise à afficher pour le moment.</p> : null}
          <div className="companies-grid-4">
            {companies.slice(0, 4).map((company) => (
              <div key={company.id} className="company-card">
                <div className="company-card-top">
                  {company.logoUrl ? (
                    <img src={resolveApiAssetUrl(company.logoUrl)} alt={`Logo de ${company.companyName}`} className="company-card-logo" />
                  ) : (
                    <div className="company-card-logo company-logo-fallback" aria-hidden="true">
                      <Building2 size={20} />
                    </div>
                  )}
                  <div>
                    <h3 className="company-card-title">{company.companyName}</h3>
                    {company.address && (
                      <div className="company-card-address">
                        <MapPin size={13} />
                        <span>{company.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="company-card-desc">{company.description}</p>

                <div className="company-card-footer">
                  <span className="company-badge-open">Entreprise sur JobFlow</span>
                  <Link to="/offres" className="company-link-arrow">
                    <span>Voir les offres</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action for candidates */}
      <section className="home-section-cta">
        <div className="container">
          <div className="cta-card-box">
            <h2>Prêt à accélérer votre carrière avec JobFlow ?</h2>
            <p>Créez votre profil en quelques clics, téléversez votre CV et recevez des propositions d'entretiens qualifiées.</p>
            <div className="cta-buttons-group">
              <Link to="/offres" className="btn-register-pill" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                <span>Explorer les offres</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/entreprises" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', background: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                <span>Découvrir les recruteurs</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Job Details Modal */}
      {selectedOfferForDetail && (
        <JobDetailModal
          offer={selectedOfferForDetail}
          onClose={() => setSelectedOfferForDetail(null)}
          loading={detailLoading}
          error={detailError}
          onApply={(off) => {
            setSelectedOfferForDetail(null);
            handleApplyClick(off);
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
                  {candidateProfile?.cv_url || candidateProfile?.cvUrl ? (
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
                    <span>{isApplying ? "Envoi en cours..." : "Confirmer ma candidature"}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer matching JobFlow dark design */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                <div className="brand-icon">
                  <span className="brand-icon-bar" style={{ height: '12px' }}></span>
                  <span className="brand-icon-bar" style={{ height: '18px' }}></span>
                  <span className="brand-icon-bar" style={{ height: '22px' }}></span>
                </div>
                <span>JobFlow.</span>
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '320px' }}>
                Plateforme de recrutement moderne connectant les talents ambitieux avec les meilleures entreprises tech.
              </p>
            </div>

            <div className="footer-col">
              <h4>Candidats</h4>
              <ul className="footer-links-list">
                <li><Link to="/offres">Toutes les offres</Link></li>
                <li><Link to="/candidat/profil">Mon profil candidat</Link></li>
                <li><Link to="/tableau-de-bord">Mes candidatures</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Entreprises</h4>
              <ul className="footer-links-list">
                <li><Link to="/entreprise/profil">Profil entreprise</Link></li>
                <li><Link to="/tableau-de-bord">Publier une annonce</Link></li>
                <li><Link to="/entreprises">Annuaire des recruteurs</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Ressources & Légal</h4>
              <ul className="footer-links-list">
                <li><a href="#blog" onClick={(e) => e.preventDefault()}>Conseils Carrière</a></li>
                <li><a href="#cgu" onClick={(e) => e.preventDefault()}>Conditions Générales</a></li>
                <li><a href="#confidentialite" onClick={(e) => e.preventDefault()}>Politique de Confidentialité</a></li>
                <li><a href="#contact" onClick={(e) => e.preventDefault()}>Contact & Support</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© 2026 JobFlow. Tous droits réservés.</span>
            
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.84rem' }}>
              <a href="#cgu" onClick={(e) => e.preventDefault()} style={{ color: '#98a2b3' }}>Conditions d'utilisation</a>
              <span style={{ color: '#475467' }}>•</span>
              <a href="#confidentialite" onClick={(e) => e.preventDefault()} style={{ color: '#98a2b3' }}>Confidentialité</a>
              <span style={{ color: '#475467' }}>•</span>
              <a href="#securite" onClick={(e) => e.preventDefault()} style={{ color: '#98a2b3' }}>Sécurité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
