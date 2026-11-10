import React from 'react';
import { X, MapPin, Banknote, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { resolveApiAssetUrl } from '../../services/api';
import './JobDetailModal.css';

const contractLabels = {
  FULL_TIME: 'CDI / Temps plein',
  PART_TIME: 'Temps partiel',
  INTERNSHIP: 'Stage',
  CONTRACT: 'Freelance / Contrat',
  TEMPORARY: 'Intérim'
};

export function JobDetailModal({ offer, onClose, onApply, loading = false, error = '' }) {
  if (!offer) return null;
  const companyName = offer.companyName || offer.company_name || '';
  const companyLogo = offer.companyLogoUrl || offer.company_logo;
  const contractType = offer.contractType || offer.contract_type;
  const salaryMin = offer.salaryMin ?? offer.salary_min;
  const salaryMax = offer.salaryMax ?? offer.salary_max;
  const publicationDate = offer.publicationDate || offer.publication_date;

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Rémunération selon profil';
    if (min && max) return `${(min / 1000).toFixed(0)}k – ${(max / 1000).toFixed(0)}k € / an`;
    if (min) return `À partir de ${(min / 1000).toFixed(0)}k €`;
    return `Jusqu'à ${(max / 1000).toFixed(0)}k €`;
  };

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
            <img src={resolveApiAssetUrl(companyLogo)} alt={companyName} className="job-detail-logo" />
          ) : (
            <div className="job-company-logo-placeholder" style={{ width: '68px', height: '68px', fontSize: '1.4rem' }}>
              {companyName.charAt(0) || 'J'}
            </div>
          )}

          <div className="job-detail-title-group" style={{ paddingRight: '36px' }}>
            <h2>{offer.title}</h2>
            <div className="job-detail-company">{companyName}</div>
          </div>
        </div>

        {loading && <p role="status" style={{ marginTop: '16px' }}>Chargement des détails…</p>}
        {error && (
          <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: '#b42318' }}>
            <AlertCircle size={18} />
            <span>{error} Les informations de la liste restent affichées.</span>
          </div>
        )}

        {/* Meta badges row */}
        <div className="job-detail-meta-pills">
          <span className="job-pill-contract" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {contractLabels[contractType] || contractType}
          </span>
          {offer.location && (
            <span className="job-pill-location" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <MapPin size={15} />
              <span>{offer.location}</span>
            </span>
          )}
          {(salaryMin || salaryMax) && (
            <span className="job-pill-salary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <Banknote size={15} />
              <span>{formatSalary(salaryMin, salaryMax)}</span>
            </span>
          )}
          <span className="job-posted-time" style={{ fontSize: '0.85rem', marginLeft: 'auto' }}>
            <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Publiée le {new Date(publicationDate || Date.now()).toLocaleDateString('fr-FR')}
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

        {/* Actions Footer */}
        <div className="form-actions-footer" style={{ marginTop: '12px' }}>
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
