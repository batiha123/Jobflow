import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../data/dbStore';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User, Save, CheckCircle2, Upload, Trash2, Camera, FileText, Download, Eye, Check } from 'lucide-react';
import '../CompanyProfile/CompanyProfileForm.css';
import './CandidateProfileForm.css';

export function CandidateProfileForm({ onProfileUpdated }) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [profile, setProfile] = useState({
    photo_url: '',
    headline: '',
    about_me: '',
    skills: '',
    education: '',
    experience: '',
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    cv_url: '',
    cv_filename: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Try to load from Spring Boot Backend first
    if (currentUser.id) {
      api.candidates.getProfile(currentUser.id)
        .then(p => {
          if (p) {
            setProfile(prev => ({
              ...prev,
              name: p.name || currentUser.name || '',
              email: p.email || currentUser.email || '',
              phone: p.phone || '',
              headline: p.headline || '',
              about_me: p.aboutMe || '',
              skills: p.skills || '',
              education: p.education || '',
              experience: p.experience || '',
              photo_url: p.photoUrl || '',
              cv_url: p.cvUrl || prev.cv_url || '',
              cv_filename: p.cvUrl ? 'Mon_CV.pdf' : prev.cv_filename || ''
            }));
            return;
          }
        })
        .catch(() => {
          // fallback to dbStore
        });
    }

    // fallback to dbStore
    const existing = db.getCandidateProfileByUser(currentUser);
    if (existing) {
      setProfile(prev => ({
        ...prev,
        photo_url: existing.photo_url || prev.photo_url || '',
        headline: existing.headline || prev.headline || '',
        about_me: existing.about_me || prev.about_me || '',
        skills: existing.skills || prev.skills || '',
        education: existing.education || prev.education || '',
        experience: existing.experience || prev.experience || '',
        name: existing.name || currentUser.name || '',
        email: existing.email || currentUser.email || '',
        phone: existing.phone || currentUser.phone || '',
        cv_url: existing.cv_url || prev.cv_url || '',
        cv_filename: existing.cv_filename || prev.cv_filename || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La taille du fichier photo ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('photo_url', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    handleChange('photo_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // CV Upload from PC
  const handleCvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("La taille du CV ne doit pas dépasser 10 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setProfile(prev => ({
        ...prev,
        cv_url: base64Data,
        cv_filename: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCv = () => {
    setProfile(prev => ({ ...prev, cv_url: '', cv_filename: '' }));
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Save in Spring Boot backend (MySQL)
      if (currentUser?.id) {
        await api.candidates.updateProfile(currentUser.id, {
          name: profile.name,
          phone: profile.phone,
          headline: profile.headline,
          aboutMe: profile.about_me,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience,
          photoUrl: profile.photo_url,
          cvUrl: profile.cv_url
        });
      }

      // 2. Also sync local dbStore
      db.updateCandidateProfileByUser(currentUser, profile);

      setSavedSuccess(true);
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
      // Fallback save in dbStore
      db.updateCandidateProfileByUser(currentUser, profile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="candidate-profile-card">
      <div className="profile-header-banner">
        <div className="profile-title-group">
          <h2>Mon Profil & CV Candidat</h2>
          <p>Mettez à jour vos informations, compétences et votre CV pour postuler facilement aux offres d'emploi.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="save-success-banner">
          <CheckCircle2 size={18} />
          <span>Profil et CV enregistrés avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Photo avatar upload from PC */}
        <div className="candidate-avatar-preview-row">
          <div 
            className="candidate-avatar-wrap" 
            onClick={() => fileInputRef.current?.click()}
            title="Cliquer pour choisir une photo depuis votre PC"
          >
            {profile.photo_url ? (
              <img 
                src={profile.photo_url} 
                alt="Avatar candidat" 
                className="candidate-avatar-img"
              />
            ) : (
              <div className="candidate-avatar-img candidate-avatar-placeholder">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div className="avatar-hover-overlay">
              <Camera size={20} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>
              <span>Photo de profil</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                style={{ display: 'none' }}
                onChange={handlePhotoUpload} 
              />
              <button 
                type="button" 
                className="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>Importer une photo depuis mon PC</span>
              </button>

              {profile.photo_url && (
                <button 
                  type="button" 
                  className="btn-remove-photo"
                  onClick={handleRemovePhoto}
                  title="Supprimer la photo"
                >
                  <Trash2 size={15} />
                  <span>Supprimer</span>
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
              Formats acceptés : JPG, PNG ou WebP (max. 5 Mo).
            </p>
          </div>
        </div>

        {/* SECTION: CURRICULUM VITAE (CV) UPLOAD */}
        <div className="cv-upload-card-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Curriculum Vitae (CV)
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Ce document sera automatiquement joint à vos futures candidatures auprès des recruteurs.
              </p>
            </div>
          </div>

          <input 
            type="file" 
            ref={cvInputRef} 
            accept=".pdf,.doc,.docx,application/pdf"
            style={{ display: 'none' }} 
            onChange={handleCvUpload}
          />

          {profile.cv_url ? (
            <div className="cv-attached-pill">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <Check size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {profile.cv_filename || "Mon_CV_Candidat.pdf"}
                </span>
                <span className="cv-active-tag">Prêt pour postuler</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <a 
                  href={profile.cv_url} 
                  download={profile.cv_filename || "Mon_CV.pdf"}
                  className="btn-cv-action"
                  title="Télécharger / Visualiser"
                >
                  <Eye size={14} />
                  <span>Visualiser</span>
                </a>
                <button 
                  type="button" 
                  className="btn-cv-action"
                  onClick={() => cvInputRef.current?.click()}
                  title="Remplacer par un autre fichier"
                >
                  <Upload size={14} />
                  <span>Remplacer</span>
                </button>
                <button 
                  type="button" 
                  className="btn-cv-action"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={handleRemoveCv}
                  title="Supprimer le CV"
                >
                  <Trash2 size={14} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="cv-empty-dropzone" onClick={() => cvInputRef.current?.click()}>
              <Upload size={24} style={{ color: 'var(--color-primary)', marginBottom: '6px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Importer mon CV depuis mon ordinateur
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Fichiers acceptés : PDF ou Word (.docx) jusqu'à 10 Mo.
              </div>
            </div>
          )}
        </div>

        <div className="form-grid-2">
          {/* name */}
          <div className="form-group">
            <label className="form-label">
              <span>Nom complet</span>
            </label>
            <input 
              type="text"
              className="form-input"
              required
              placeholder="Ex: Yasmine Benali"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          {/* email */}
          <div className="form-group">
            <label className="form-label">
              <span>Adresse email</span>
            </label>
            <input 
              type="email"
              className="form-input"
              required
              placeholder="nom@exemple.com"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          {/* phone */}
          <div className="form-group">
            <label className="form-label">
              <span>Numéro de téléphone</span>
            </label>
            <input 
              type="tel"
              className="form-input"
              placeholder="+33 6 12 34 56 78"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          {/* headline */}
          <div className="form-group">
            <label className="form-label">
              <span>Titre / Accroche professionnelle</span>
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="Ex: Développeur Fullstack React & Spring Boot"
              value={profile.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
            />
          </div>

          {/* skills */}
          <div className="form-group full-width">
            <label className="form-label">
              <span>Compétences clés (séparées par des virgules)</span>
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="React, JavaScript, Spring Boot, MySQL, CSS Modules"
              value={profile.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
            />
            {profile.skills && (
              <div className="candidate-skills-pill-box">
                {profile.skills.split(',').filter(s => s.trim().length > 0).map((skill, idx) => (
                  <span key={idx} className="candidate-skill-pill">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* about_me */}
          <div className="form-group full-width">
            <label className="form-label">
              <span>À propos de moi (Bio)</span>
            </label>
            <textarea 
              className="form-textarea"
              placeholder="Présentez votre parcours, vos ambitions et ce qui vous passionne..."
              value={profile.about_me}
              onChange={(e) => handleChange('about_me', e.target.value)}
            />
          </div>

          {/* experience */}
          <div className="form-group full-width">
            <label className="form-label">
              <span>Expériences professionnelles</span>
            </label>
            <textarea 
              className="form-textarea"
              placeholder="Poste, entreprise, réalisations clés, technologies utilisées..."
              value={profile.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
            />
          </div>

          {/* education */}
          <div className="form-group full-width">
            <label className="form-label">
              <span>Formations & Diplômes</span>
            </label>
            <textarea 
              className="form-textarea"
              placeholder="Diplôme, école ou université, année d'obtention..."
              value={profile.education}
              onChange={(e) => handleChange('education', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions-footer">
          <button type="submit" className="btn-primary-save" disabled={isSaving}>
            <Save size={16} />
            <span>{isSaving ? "Enregistrement..." : "Mettre à jour mon profil & CV"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
