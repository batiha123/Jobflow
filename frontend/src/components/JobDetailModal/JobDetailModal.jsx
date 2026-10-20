import React from 'react';
import { X, MapPin, Banknote, Clock, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import './JobDetailModal.css';

const contractLabels = {
  FULL_TIME: 'CDI / Temps plein',
  PART_TIME: 'Temps partiel',
  INTERNSHIP: 'Stage',
  CONTRACT: 'Freelance / Contrat',
  TEMPORARY: 'Intérim'
};

export function JobDetailModal({ offer, onClose, onApply }) {
  if (!offer) return null;

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
          {offer.company_logo ? (
            <img src={offer.company_logo} alt={offer.company_name} className="job-detail-logo" />
          ) : (
            <div className="job-company-logo-placeholder" style={{ width: '68px', height: '68px', fontSize: '1.4rem' }}>
              {offer.company_name?.charAt(0) || 'J'}
            </div>
          )}

          <div className="job-detail-title-group" style={{ paddingRight: '36px' }}>
            <h2>{offer.title}</h2>
            <div className="job-detail-company">{offer.company_name}</div>
          </div>
        </div>

        {/* Meta badges row */}
        <div className="job-detail-meta-pills">
          <span className="job-pill-contract" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {contractLabels[offer.contract_type] || offer.contract_type}
          </span>
          {offer.location && (
            <span className="job-pill-location" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <MapPin size={15} />
              <span>{offer.location}</span>
            </span>
          )}
          {(offer.salary_min || offer.salary_max) && (
            <span className="job-pill-salary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <Banknote size={15} />
              <span>{formatSalary(offer.salary_min, offer.salary_max)}</span>
            </span>
          )}
          <span className="job-posted-time" style={{ fontSize: '0.85rem', marginLeft: 'auto' }}>
            <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Publiée le {new Date(offer.publication_date || Date.now()).toLocaleDateString('fr-FR')}
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
