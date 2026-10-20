import React from 'react';
import { MapPin, Banknote, ArrowRight, Clock, Eye } from 'lucide-react';
import './JobCard.css';

const contractLabels = {
  FULL_TIME: 'CDI / Temps plein',
  PART_TIME: 'Temps partiel',
  INTERNSHIP: 'Stage',
  CONTRACT: 'Freelance / Contrat',
  TEMPORARY: 'Intérim'
};

export function JobCard({ offer, onApply, onViewDetails }) {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salaire selon profil';
    if (min && max) return `${(min / 1000).toFixed(0)}k – ${(max / 1000).toFixed(0)}k €`;
    if (min) return `À partir de ${(min / 1000).toFixed(0)}k €`;
    return `Jusqu'à ${(max / 1000).toFixed(0)}k €`;
  };

  return (
    <div className="job-card" onClick={() => onViewDetails && onViewDetails(offer)} style={{ cursor: 'pointer' }}>
      <div>
        <div className="job-card-header">
          {offer.company_logo ? (
            <img 
              src={offer.company_logo} 
              alt={offer.company_name} 
              className="job-company-logo" 
            />
          ) : (
            <div className="job-company-logo-placeholder">
              {offer.company_name?.charAt(0) || 'J'}
            </div>
          )}

          <div className="job-meta-header">
            <h3 className="job-title">{offer.title}</h3>
            <span className="job-company-name">{offer.company_name}</span>
          </div>
        </div>

        <p className="job-description-excerpt" style={{ marginTop: '12px' }}>
          {offer.description}
        </p>
      </div>

      <div className="job-tags-row">
        <span className="job-pill-contract">
          {contractLabels[offer.contract_type] || offer.contract_type}
        </span>
        {offer.location && (
          <span className="job-pill-location">
            <MapPin size={13} />
            <span>{offer.location}</span>
          </span>
        )}
        {(offer.salary_min || offer.salary_max) && (
          <span className="job-pill-salary">
            <Banknote size={13} />
            <span>{formatSalary(offer.salary_min, offer.salary_max)}</span>
          </span>
        )}
      </div>

      <div className="job-card-footer" onClick={(e) => e.stopPropagation()}>
        <span className="job-posted-time">
          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
          {offer.publication_date ? new Date(offer.publication_date).toLocaleDateString('fr-FR') : 'Récent'}
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            onClick={() => onViewDetails && onViewDetails(offer)}
          >
            <Eye size={13} />
            <span>Détails</span>
          </button>

          <button 
            type="button" 
            className="btn-apply-job"
            onClick={() => onApply && onApply(offer)}
          >
            <span>Postuler</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
