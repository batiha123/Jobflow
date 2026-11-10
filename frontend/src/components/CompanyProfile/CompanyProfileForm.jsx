import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast/Toast';
import {
  createCompanyProfile,
  deleteCompanyLogo,
  getMyCompanyProfile,
  resolveApiAssetUrl,
  updateMyCompanyProfile,
  uploadCompanyLogo
} from '../../services/api';
import './CompanyProfileForm.css';

const emptyProfile = {
  companyName: '',
  description: '',
  address: '',
  website: '',
  logoUrl: ''
};

function getAccountContact(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  };
}

export function CompanyProfileForm({ onProfileUpdated }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(emptyProfile);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [reloadProfileKey, setReloadProfileKey] = useState(0);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      if (!currentUser) {
        setError('Connectez-vous pour charger le profil entreprise.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const result = await getMyCompanyProfile({ signal: controller.signal });
        setProfile({
          companyName: result.companyName || '',
          description: result.description || '',
          address: result.address || '',
          website: result.website || '',
          logoUrl: result.logoUrl || ''
        });
        setHasProfile(true);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        if (requestError.status === 404) {
          setProfile({
            ...emptyProfile,
            companyName: currentUser.companyName || currentUser.name || ''
          });
          setHasProfile(false);
        } else {
          setError(requestError.message || 'Impossible de charger le profil entreprise.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProfile();
    return () => controller.abort();
  }, [currentUser, reloadProfileKey]);

  const handleChange = (field, value) => {
    setProfile(previous => ({ ...previous, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSavedSuccess(false);

    const request = {
      companyName: profile.companyName.trim(),
      description: profile.description,
      address: profile.address,
      website: profile.website
    };

    try {
      const savedProfile = hasProfile
        ? await updateMyCompanyProfile(request)
        : await createCompanyProfile(request);
      setProfile({
        companyName: savedProfile.companyName || '',
        description: savedProfile.description || '',
        address: savedProfile.address || '',
        website: savedProfile.website || '',
        logoUrl: savedProfile.logoUrl || ''
      });
      setHasProfile(true);
      setSavedSuccess(true);
      toast.success('Profil entreprise enregistré.');
      onProfileUpdated?.(savedProfile);
    } catch (requestError) {
      setError(requestError.message || 'Impossible d’enregistrer le profil entreprise.');
      toast.error(requestError.message || 'Impossible d’enregistrer le profil entreprise.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!hasProfile) {
      setError('Enregistrez d’abord le profil entreprise avant d’ajouter un logo.');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);
    setError('');
    try {
      const savedProfile = await uploadCompanyLogo(file);
      setProfile(previous => ({ ...previous, logoUrl: savedProfile.logoUrl || '' }));
      setPreviewUrl('');
      toast.success('Logo entreprise téléversé.');
      onProfileUpdated?.(savedProfile);
    } catch (requestError) {
      setPreviewUrl('');
      setError(requestError.message || 'Impossible de téléverser le logo.');
      toast.error(requestError.message || 'Impossible de téléverser le logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!profile.logoUrl) return;
    setDeletingLogo(true);
    setError('');
    try {
      const savedProfile = await deleteCompanyLogo();
      setProfile(previous => ({ ...previous, logoUrl: savedProfile.logoUrl || '' }));
      toast.success('Logo entreprise supprimé.');
      onProfileUpdated?.(savedProfile);
    } catch (requestError) {
      setError(requestError.message || 'Impossible de supprimer le logo.');
      toast.error(requestError.message || 'Impossible de supprimer le logo.');
    } finally {
      setDeletingLogo(false);
    }
  };

  const contact = getAccountContact(currentUser);
  const logo = previewUrl || resolveApiAssetUrl(profile.logoUrl);

  return (
    <div className="profile-editor-card">
      <div className="profile-header-banner">
        <div className="profile-title-group">
          <h2>Profil Entreprise</h2>
          <p>Mettez à jour les informations de votre entreprise.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="save-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
          {currentUser && !hasProfile && (
            <button type="button" className="btn-secondary" onClick={() => {
              setLoading(true);
              setError('');
              setReloadProfileKey(key => key + 1);
            }}>
              Réessayer
            </button>
          )}
        </div>
      )}
      {savedSuccess && (
        <div className="save-success-banner">
          <CheckCircle2 size={18} />
          <span>Modifications enregistrées avec succès !</span>
        </div>
      )}
      {loading ? (
        <p role="status">Chargement du profil entreprise…</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="company-name">Nom de l'entreprise</label>
              <input
                id="company-name"
                type="text"
                className="form-input"
                maxLength={200}
                required
                value={profile.companyName}
                onChange={event => handleChange('companyName', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="company-website">Site Web</label>
              <input
                id="company-website"
                type="url"
                className="form-input"
                maxLength={500}
                placeholder="https://votre-entreprise.com"
                value={profile.website}
                onChange={event => handleChange('website', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="company-address">Adresse du siège</label>
              <input
                id="company-address"
                type="text"
                className="form-input"
                maxLength={255}
                value={profile.address}
                onChange={event => handleChange('address', event.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="company-logo">Logo de l'entreprise</label>
              <div className="logo-preview-box">
                <div className="company-logo-preview">
                  {logo ? (
                    <img src={logo} alt={`Logo de ${profile.companyName || 'l’entreprise'}`} />
                  ) : (
                    <Building2 size={28} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <input
                    id="company-logo"
                    type="file"
                    accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                    onChange={handleLogoUpload}
                    disabled={!hasProfile || uploading || deletingLogo}
                  />
                  <p className="logo-help-text">PNG ou JPEG, 5 Mo maximum. SVG et WebP ne sont pas acceptés.</p>
                  {profile.logoUrl && (
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={handleRemoveLogo}
                      disabled={deletingLogo || uploading}
                    >
                      <Trash2 size={15} />
                      <span>{deletingLogo ? 'Suppression…' : 'Supprimer le logo'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="company-description">Description &amp; activité</label>
              <textarea
                id="company-description"
                className="form-textarea"
                value={profile.description}
                onChange={event => handleChange('description', event.target.value)}
              />
            </div>
          </div>

          <section className="company-account-contact" aria-labelledby="account-contact-title">
            <h3 id="account-contact-title">Coordonnées du compte connecté</h3>
            <p>
              Ces champs appartiennent au compte utilisateur. Le DTO CompanyProfile du backend ne permet pas
              de les modifier depuis ce formulaire.
            </p>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Nom du contact</label>
                <input id="contact-name" className="form-input" value={contact.name} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email du compte</label>
                <input id="contact-email" className="form-input" value={contact.email} readOnly />
              </div>
              <div className="form-group full-width">
                <label className="form-label" htmlFor="contact-phone">Téléphone du compte</label>
                <input id="contact-phone" className="form-input" value={contact.phone} readOnly />
              </div>
            </div>
          </section>

          <div className="form-actions-footer">
            <button type="submit" className="btn-primary-save" disabled={saving || uploading || deletingLogo}>
              <Save size={16} />
              <span>{saving ? 'Enregistrement…' : hasProfile ? 'Enregistrer les modifications' : 'Créer le profil'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
