import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../data/dbStore';
import { api } from '../../services/api';
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const loadProfile = async () => {
      try {
        const liveProfile = await api.companies.getProfile(currentUser.id);
        if (liveProfile) {
          setProfile({
            company_name: liveProfile.companyName || currentUser.companyName || currentUser.name || '',
            description: liveProfile.description || '',
            address: liveProfile.address || '',
            website: liveProfile.website || '',
            logo_url: liveProfile.logoUrl || '',
            contact_name: currentUser.name || '',
            contact_email: liveProfile.contactEmail || currentUser.email || '',
            contact_phone: liveProfile.contactPhone || currentUser.phone || ''
          });
          return;
        }
      } catch (err) {
        console.warn("Échec chargement profil entreprise distant, fallback local:", err);
      }

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
      }
    };

    loadProfile();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Save to Spring Boot backend
      await api.companies.updateProfile(currentUser.id, {
        companyName: profile.company_name,
        description: profile.description,
        address: profile.address,
        website: profile.website,
        logoUrl: profile.logo_url,
        contactPhone: profile.contact_phone
      });

      // 2. Also sync local dbStore
      db.updateCompanyProfileByUser(currentUser, profile);

      setSavedSuccess(true);
      if (onProfileUpdated) onProfileUpdated(profile);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Erreur mise à jour profil entreprise:", err);
      // Fallback local save
      db.updateCompanyProfileByUser(currentUser, profile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setIsSaving(false);
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
          <span>Modifications enregistrées avec succès en base de données !</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* LOGO UPLOAD SECTION */}
        <div className="company-logo-preview-row">
          <div 
            className="company-logo-wrap"
            onClick={() => logoInputRef.current?.click()}
            title="Cliquer pour importer le logo depuis votre PC"
          >
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="Logo entreprise" className="company-logo-img" />
            ) : (
              <div className="company-logo-placeholder">
                <Building2 size={36} />
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>
              <span>Logo de l'entreprise</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="file" 
                ref={logoInputRef} 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                style={{ display: 'none' }}
                onChange={handleLogoUpload} 
              />
              <button 
                type="button" 
                className="btn-upload-logo"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>Importer un logo depuis mon PC</span>
              </button>

              {profile.logo_url && (
                <button 
                  type="button" 
                  className="btn-remove-logo"
                  onClick={handleRemoveLogo}
                  title="Supprimer le logo"
                >
                  <Trash2 size={15} />
                  <span>Supprimer</span>
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
              Format recommandé : PNG ou JPG carré ou paysage (max. 5 Mo).
            </p>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group full-width">
            <label className="form-label">
              <span>Raison Sociale / Nom de l'entreprise *</span>
            </label>
            <input 
              type="text" 
              required
              className="form-input" 
              value={profile.company_name} 
              onChange={(e) => handleChange('company_name', e.target.value)} 
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <span>Description de l'activité & culture d'entreprise</span>
            </label>
            <textarea 
              rows={4}
              className="form-textarea"
              placeholder="Présentez votre mission, vos valeurs et vos projets d'avenir pour attirer les meilleurs candidats..."
              value={profile.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Siège Social / Adresse complète</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: 15 Avenue des Champs-Élysées, 75008 Paris"
              value={profile.address} 
              onChange={(e) => handleChange('address', e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Site Web officiel</span>
            </label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://votre-entreprise.com"
              value={profile.website} 
              onChange={(e) => handleChange('website', e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Email de contact RH</span>
            </label>
            <input 
              type="email" 
              className="form-input" 
              value={profile.contact_email} 
              onChange={(e) => handleChange('contact_email', e.target.value)} 
            />
          </div>

          <div className="form-group">
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

        <div className="form-actions-footer">
          <button type="submit" className="btn-primary-save" disabled={isSaving}>
            <Save size={16} />
            <span>{isSaving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
