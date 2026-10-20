import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../data/dbStore';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Save, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import './CompanyProfileForm.css';

export function CompanyProfileForm({ onProfileUpdated }) {
  const { currentUser } = useAuth();
  const logoInputRef = useRef(null);

  const [profile, setProfile] = useState({
    company_name: currentUser?.companyName || currentUser?.name || '',
    description: '',
    address: '',
    website: '',
    logo_url: '',
    contact_name: currentUser?.name || '',
    contact_email: currentUser?.email || '',
    contact_phone: currentUser?.phone || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const existing = db.getCompanyProfileByUser(currentUser);
    if (existing) {
      setProfile({
        company_name: existing.company_name || currentUser.companyName || currentUser.name || '',
        description: existing.description || '',
        address: existing.address || '',
        website: existing.website || '',
        logo_url: existing.logo_url || '',
        contact_name: existing.contact_name || currentUser.name || '',
        contact_email: existing.contact_email || currentUser.email || '',
        contact_phone: existing.contact_phone || currentUser.phone || ''
      });
    } else {
      setProfile({
        company_name: currentUser.companyName || currentUser.name || '',
        description: '',
        address: '',
        website: '',
        logo_url: '',
        contact_name: currentUser.name || '',
        contact_email: currentUser.email || '',
        contact_phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La taille du fichier ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('logo_url', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange('logo_url', '');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = db.updateCompanyProfileByUser(currentUser, profile);
    if (updated) {
      setSavedSuccess(true);
      if (onProfileUpdated) onProfileUpdated(updated);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  return (
    <div className="profile-editor-card">
      <div className="profile-header-banner">
        <div className="profile-title-group">
          <h2>Profil Entreprise</h2>
          <p>Mettez à jour les informations et coordonnées de votre entreprise.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="save-success-banner">
          <CheckCircle2 size={18} />
          <span>Modifications enregistrées avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* company_name */}
          <div className="form-group full-width">
            <label className="form-label">
              <span>Nom de l'entreprise</span>
            </label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Nova Studio, Greenly..."
              value={profile.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>

          {/* website */}
          <div className="form-group">
            <label className="form-label">
              <span>Site Web</span>
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://votre-entreprise.com"
              value={profile.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>

          {/* address */}
          <div className="form-group">
            <label className="form-label">
              <span>Adresse du siège</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: 15 Avenue des Champs-Élysées, Paris"
              value={profile.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          {/* logo file upload from PC */}
          <div className="form-group full-width">
            <label className="form-label" style={{ marginBottom: '6px' }}>
              <span>Logo de l'entreprise</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '6px' }}>
              <div 
                style={{ 
                  width: '72px', 
                  height: '72px', 
                  borderRadius: '12px', 
                  border: '2px dashed var(--border-default)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'var(--bg-surface-alt)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
                onClick={() => logoInputRef.current?.click()}
                title="Cliquer pour choisir un logo depuis votre PC"
              >
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={28} style={{ color: 'var(--text-tertiary)' }} />
                )}
              </div>

              <div>
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload} 
                />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn-upload-photo"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload size={15} />
                    <span>Importer le logo depuis mon PC</span>
                  </button>
                  {profile.logo_url && (
                    <button 
                      type="button" 
                      className="btn-remove-photo"
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 size={15} />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                  Formats acceptés : PNG, JPG, WebP ou SVG (max. 5 Mo).
                </p>
              </div>
            </div>
          </div>

          {/* description */}
          <div className="form-group full-width">
            <label className="form-label">
              <span>Description & Activité de l'entreprise</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Présentez votre entreprise, vos valeurs, vos projets innovants..."
              value={profile.description}
              onChange={(e) => handleChange('description', e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Section: Linked User Data */}
        <div style={{ marginTop: '20px', marginBottom: '20px', borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            Coordonnées du Responsable RH / Contact
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '18px' }}>
            Ces coordonnées sont utilisées pour la communication avec les candidats.
          </p>

          <div className="form-grid-2">
            {/* contact_name */}
            <div className="form-group">
              <label className="form-label">
                <span>Nom du contact RH / Représentant</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Sophie Mercier"
                value={profile.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
              />
            </div>

            {/* contact_email */}
            <div className="form-group">
              <label className="form-label">
                <span>Email de contact</span>
              </label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="contact@entreprise.com"
                value={profile.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
            </div>

            {/* contact_phone */}
            <div className="form-group full-width">
              <label className="form-label">
                <span>Téléphone professionnel</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="+33 1 42 68 90 00"
                value={profile.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="form-actions-footer">
          <button type="submit" className="btn-primary-save">
            <Save size={16} />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
}
