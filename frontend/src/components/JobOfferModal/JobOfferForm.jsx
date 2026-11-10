import React, { useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { useToast } from '../Toast/Toast';
import { createJobOffer, updateMyJobOffer } from '../../services/api';
import './JobOfferForm.css';

const initialFormValues = offer => ({
  title: offer?.title || '',
  description: offer?.description || '',
  contractType: offer?.contractType || offer?.contract_type || 'FULL_TIME',
  location: offer?.location || '',
  salaryMin: offer?.salaryMin ?? offer?.salary_min ?? '',
  salaryMax: offer?.salaryMax ?? offer?.salary_max ?? ''
});

export function JobOfferForm({ initialData, onClose, onSaved }) {
  const toast = useToast();
  const [formData, setFormData] = useState(() => initialFormValues(initialData));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(previous => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    if (initialData?.id && initialData.status !== 'DRAFT') {
      setError('Seules les offres en brouillon peuvent être modifiées.');
      return;
    }

    const salaryMin = formData.salaryMin === '' ? null : Number(formData.salaryMin);
    const salaryMax = formData.salaryMax === '' ? null : Number(formData.salaryMax);
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      setError('Le salaire minimum ne peut pas dépasser le salaire maximum.');
      return;
    }

    const request = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      contractType: formData.contractType,
      salaryMin,
      salaryMax
    };

    setSaving(true);
    try {
      const savedOffer = initialData?.id
        ? await updateMyJobOffer(initialData.id, request)
        : await createJobOffer(request);
      toast.success(initialData?.id ? 'Brouillon mis à jour.' : 'Brouillon créé.');
      onSaved?.(savedOffer);
      onClose?.();
    } catch (requestError) {
      setError(requestError.message || 'Impossible d’enregistrer cette offre.');
      toast.error(requestError.message || 'Impossible d’enregistrer cette offre.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="job-offer-modal-card">
        <div className="modal-header-row">
          <div>
            <h3 className="modal-title">
              {initialData?.id ? 'Modifier le brouillon' : 'Créer une offre d’emploi'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              L’offre sera créée en brouillon. Vous pourrez ensuite la soumettre pour validation.
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} disabled={saving} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div role="alert" className="save-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="offer-title">Titre du poste</label>
              <input
                id="offer-title"
                type="text"
                className="form-input"
                maxLength={255}
                required
                value={formData.title}
                onChange={event => handleChange('title', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="offer-contract">Type de contrat</label>
              <select
                id="offer-contract"
                className="form-input"
                required
                value={formData.contractType}
                onChange={event => handleChange('contractType', event.target.value)}
              >
                <option value="FULL_TIME">CDI (Temps plein)</option>
                <option value="PART_TIME">Temps partiel</option>
                <option value="INTERNSHIP">Stage</option>
                <option value="CONTRACT">Freelance / Indépendant</option>
                <option value="TEMPORARY">CDD / Intérim</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="offer-location">Localisation</label>
              <input
                id="offer-location"
                type="text"
                className="form-input"
                maxLength={255}
                value={formData.location}
                onChange={event => handleChange('location', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="offer-salary-min">Salaire minimum (€ / an)</label>
              <input
                id="offer-salary-min"
                type="number"
                className="form-input"
                min="0"
                step="0.01"
                value={formData.salaryMin}
                onChange={event => handleChange('salaryMin', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="offer-salary-max">Salaire maximum (€ / an)</label>
              <input
                id="offer-salary-max"
                type="number"
                className="form-input"
                min="0"
                step="0.01"
                value={formData.salaryMax}
                onChange={event => handleChange('salaryMax', event.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="offer-description">Description détaillée du poste</label>
              <textarea
                id="offer-description"
                className="form-textarea"
                rows={5}
                required
                value={formData.description}
                onChange={event => handleChange('description', event.target.value)}
              />
            </div>
          </div>

          <div className="form-actions-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="btn-primary-save" disabled={saving}>
              <Check size={16} />
              <span>{saving ? 'Enregistrement…' : initialData?.id ? 'Enregistrer le brouillon' : 'Créer le brouillon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
