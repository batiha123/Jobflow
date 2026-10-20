import React, { useState } from 'react';
import { X, MapPin, Banknote, Clock, ArrowRight, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './JobDetailModal.css';

const contractLabels = {
  FULL_TIME: 'CDI / Temps plein',
  PART_TIME: 'Temps partiel',
  INTERNSHIP: 'Stage',
  CONTRACT: 'Freelance / Contrat',
  TEMPORARY: 'Intérim'
};

export function JobDetailModal({ offer, onClose, onApply }) {
  const { currentUser } = useAuth();
  const [reportedSuccess, setReportedSuccess] = useState(false);
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState('');

  if (!offer) return null;

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Rémunération selon profil';
    if (min && max) return `${(min / 1000).toFixed(0)}k – ${(max / 1000).toFixed(0)}k € / an`;
    if (min) return `À partir de ${(min / 1000).toFixed(0)}k €`;
    return `Jusqu'à ${(max / 1000).toFixed(0)}k €`;
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportReason) return;

    try {
      await api.admin.reportJob(
        offer.id,
        currentUser?.id || 1,
        reportReason,
        "Signalé par un utilisateur via la fiche détaillée de l'offre."
      );
    } catch (err) {
      console.warn("Échec transmission signalement API:", err);
    }

    setReportedSuccess(true);
    setShowReportInput(false);
  };

  const companyLogo = offer.company_logo || offer.companyLogo;
  const companyName = offer.company_name || offer.companyName;

  return (
    <div className="modal-backdrop">
      <div className="job-detail-modal-card">
        {/* Close Button */}
        <button 
          type="button" 
          className="btn-close-modal" 
          style={{ position: 'absolute', top: '24px', right: '24px' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="job-detail-header">
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="job-detail-logo" />
          ) : (
            <div className="job-company-logo-placeholder" style={{ width: '68px', height: '68px', fontSize: '1.4rem' }}>
              {companyName?.charAt(0) || 'J'}
            </div>
          )}

          <div className="job-detail-title-group" style={{ paddingRight: '36px' }}>
            <h2>{offer.title}</h2>
            <div className="job-detail-company">{companyName}</div>
          </div>
        </div>

        {/* Meta badges row */}
        <div className="job-detail-meta-pills">
          <span className="job-pill-contract" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {contractLabels[offer.contract_type || offer.contractType] || offer.contract_type || offer.contractType}
          </span>
          {offer.location && (
            <span className="job-pill-location" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <MapPin size={15} />
              <span>{offer.location}</span>
            </span>
          )}
          {(offer.salary_min || offer.salary_max || offer.salaryMin || offer.salaryMax) && (
            <span className="job-pill-salary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <Banknote size={15} />
              <span>{formatSalary(offer.salary_min || offer.salaryMin, offer.salary_max || offer.salaryMax)}</span>
            </span>
          )}
          <span className="job-posted-time" style={{ fontSize: '0.85rem', marginLeft: 'auto' }}>
            <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Publiée le {new Date(offer.publication_date || offer.publicationDate || Date.now()).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Description section */}
        <div className="job-detail-section">
          <h3 className="job-detail-section-title">Description du Poste</h3>
          <p className="job-detail-text">{offer.description}</p>
        </div>

        {/* Expected skills & benefits */}
        <div className="job-detail-section">
          <h3 className="job-detail-section-title">Ce que l'entreprise recherche</h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.94rem' }}>
            <li>Solide maîtrise des technologies et des bonnes pratiques du domaine.</li>
            <li>Autonomie, rigueur et esprit d'équipe au quotidien.</li>
            <li>Capacité à communiquer et à faire évoluer les projets techniques.</li>
          </ul>
        </div>

        {/* Reporting row */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fafafc', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {reportedSuccess ? (
            <div style={{ color: '#027a48', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>Signalement transmis aux administrateurs. Merci pour votre vigilance.</span>
            </div>
          ) : showReportInput ? (
            <form onSubmit={handleSendReport} style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input 
                type="text" 
                required
                placeholder="Motif (ex: informations inexactes, offre expirée, spam)..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{ flex: 1, padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#b42318' }}>
                Envoyer le signalement
              </button>
              <button type="button" className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.82rem' }} onClick={() => setShowReportInput(false)}>
                Annuler
              </button>
            </form>
          ) : (
            <>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                Cette annonce comporte une erreur ou un contenu suspect ?
              </span>
              <button 
                type="button" 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setShowReportInput(true)}
              >
                <AlertTriangle size={13} style={{ color: '#f04438' }} />
                <span>Signaler cette annonce</span>
              </button>
            </>
          )}
        </div>

        {/* Actions Footer */}
        <div className="form-actions-footer" style={{ marginTop: '16px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fermer
          </button>
          <button 
            type="button" 
            className="btn-register-pill"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            onClick={() => {
              onClose();
              if (onApply) onApply(offer);
            }}
          >
            <span>Postuler à cette offre</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
