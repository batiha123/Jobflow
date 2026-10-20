import React, { useState } from 'react';
import { db } from '../../data/dbStore';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { X, Check } from 'lucide-react';
import './JobOfferForm.css';

export function JobOfferForm({ initialData, onClose, onSaved }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    contract_type: initialData?.contract_type || initialData?.contractType || 'FULL_TIME',
    location: initialData?.location || '',
    salary_min: initialData?.salary_min || initialData?.salaryMin || '',
    salary_max: initialData?.salary_max || initialData?.salaryMax || '',
    status: initialData?.status || 'PUBLISHED'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      contractType: formData.contract_type,
      contract_type: formData.contract_type,
      salaryMin: formData.salary_min ? Number(formData.salary_min) : null,
      salaryMax: formData.salary_max ? Number(formData.salary_max) : null,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      status: formData.status
    };

    try {
      if (initialData?.id) {
        // Update on backend
        await api.jobs.update(initialData.id, currentUser.id, payload);
        const updatedLocal = db.updateJobOffer(initialData.id, formData);
        if (onSaved) onSaved(updatedLocal);
      } else {
        // Create on backend
        await api.jobs.create(currentUser.id, payload);
        const createdLocal = db.createJobOfferForCompany(currentUser, formData);
        if (onSaved) onSaved(createdLocal);
      }
    } catch (err) {
      console.warn("Erreur synchronisation API offre, fallback local:", err);
      if (initialData?.id) {
        const updatedLocal = db.updateJobOffer(initialData.id, formData);
        if (onSaved) onSaved(updatedLocal);
      } else {
        const createdLocal = db.createJobOfferForCompany(currentUser, formData);
        if (onSaved) onSaved(createdLocal);
      }
    } finally {
      setIsSubmitting(false);
      if (onClose) onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="job-offer-modal-card">
        <div className="modal-header-row">
          <div>
            <h3 className="modal-title">
              {initialData?.id ? "Modifier l'offre d'emploi" : "Créer une nouvelle annonce d'emploi"}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Publiez votre opportunité directement sur le catalogue de JobFlow.
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            {/* title */}
            <div className="form-group full-width">
              <label className="form-label">
                <span>Titre du poste *</span>
              </label>
              <input 
                type="text"
                className="form-input"
                required
                placeholder="Ex: Développeur Fullstack React / Spring Boot"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            {/* contract_type */}
            <div className="form-group">
              <label className="form-label">
                <span>Type de contrat</span>
              </label>
              <select
                className="form-input"
                value={formData.contract_type}
                onChange={(e) => handleChange('contract_type', e.target.value)}
              >
                <option value="FULL_TIME">CDI (Temps plein)</option>
                <option value="PART_TIME">Temps partiel</option>
                <option value="INTERNSHIP">Stage</option>
                <option value="CONTRACT">Freelance / Indépendant</option>
                <option value="TEMPORARY">CDD / Intérim</option>
              </select>
            </div>

            {/* location */}
            <div className="form-group">
              <label className="form-label">
                <span>Localisation</span>
              </label>
              <input 
                type="text"
                className="form-input"
                placeholder="Paris (Hybride), Lyon, Télétravail..."
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>

            {/* salary_min */}
            <div className="form-group">
              <label className="form-label">
                <span>Salaire Minimum (€ / an)</span>
              </label>
              <input 
                type="number"
                className="form-input"
                placeholder="40000"
                value={formData.salary_min}
                onChange={(e) => handleChange('salary_min', e.target.value)}
              />
            </div>

            {/* salary_max */}
            <div className="form-group">
              <label className="form-label">
                <span>Salaire Maximum (€ / an)</span>
              </label>
              <input 
                type="number"
                className="form-input"
                placeholder="55000"
                value={formData.salary_max}
                onChange={(e) => handleChange('salary_max', e.target.value)}
              />
            </div>

            {/* status */}
            <div className="form-group full-width">
              <label className="form-label">
                <span>Statut de visibilité</span>
              </label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="PUBLISHED">Publiée & Active (Visible de tous)</option>
                <option value="DRAFT">Brouillon (Non visible)</option>
                <option value="CLOSED">Clôturée / Pourvue</option>
              </select>
            </div>

            {/* description */}
            <div className="form-group full-width">
              <label className="form-label">
                <span>Description détaillée du poste & missions *</span>
              </label>
              <textarea 
                className="form-textarea"
                rows={5}
                required
                placeholder="Détaillez le rôle, les responsabilités au quotidien, les compétences souhaitées..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary-save" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? "Enregistrement..." : initialData?.id ? "Mettre à jour l'offre" : "Publier l'offre"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
