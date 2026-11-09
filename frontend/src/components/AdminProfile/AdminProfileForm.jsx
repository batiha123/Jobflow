import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Save, CheckCircle2, Shield, UserCheck, UserX, RefreshCw } from 'lucide-react';
import '../CompanyProfile/CompanyProfileForm.css';
import '../CandidateProfile/CandidateProfileForm.css';

export function AdminProfileForm({ onProfileUpdated }) {
  const { currentUser, updateCurrentUserSession } = useAuth();

  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    position: '',
    department: '',
    bio: '',
    photoUrl: ''
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAdminProfile = async () => {
    if (!currentUser?.id) return;
    try {
      const data = await api.adminProfiles.getProfile(currentUser.id);
      if (data) {
        setProfile({
          name: data.name || currentUser.name || '',
          email: data.email || currentUser.email || '',
          phone: data.phone || '',
          position: data.position || '',
          department: data.department || '',
          bio: data.bio || '',
          photoUrl: data.photoUrl || ''
        });
      }
    } catch (err) {
      console.error('Erreur chargement profil admin:', err);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await api.users.getAll();
      if (Array.isArray(list)) {
        setUsers(list);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadAdminProfile();
    loadUsers();
  }, [currentUser?.id]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setIsSaving(true);
    setErrorMsg('');
    try {
      const updated = await api.adminProfiles.updateProfile(currentUser.id, {
        name: profile.name,
        phone: profile.phone,
        position: profile.position,
        department: profile.department,
        bio: profile.bio,
        photoUrl: profile.photoUrl
      });
      if (updated?.name) {
        updateCurrentUserSession({ name: updated.name, phone: updated.phone });
      }
      setSavedSuccess(true);
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la mise à jour du profil administrateur.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      if (user.accountStatus === 'ACTIVE') {
        await api.users.suspend(user.id);
      } else {
        await api.users.activate(user.id);
      }
      await loadUsers();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      alert(err.message || "Erreur lors du changement de statut de l'utilisateur.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* CARD 1: ADMIN PROFILE */}
      <div className="candidate-profile-card">
        <div className="profile-header-banner">
          <div className="profile-title-group">
            <h2>Mon Profil Administrateur</h2>
            <p>Consultez et modifiez vos informations de profil administrateur.</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="save-success-banner">
            <CheckCircle2 size={18} />
            <span>Profil administrateur enregistré avec succès !</span>
          </div>
        )}

        {errorMsg && (
          <div className="auth-error-msg" style={{ marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Nom complet</span>
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Adresse email</span>
              </label>
              <input
                type="email"
                className="form-input"
                disabled
                value={profile.email}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Téléphone</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="+33 1 80 00 12 34"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Poste / Fonction</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Lead Platform Administrator"
                value={profile.position}
                onChange={(e) => handleChange('position', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Département</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Trust, Safety & Operations"
                value={profile.department}
                onChange={(e) => handleChange('department', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>URL Photo de profil</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={profile.photoUrl}
                onChange={(e) => handleChange('photoUrl', e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <span>Biographie</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Description de votre rôle et responsabilités..."
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions-footer">
            <button type="submit" className="btn-primary-save" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer mon profil Admin'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* CARD 2: USER ACCOUNTS MANAGEMENT (ACTIVATE / SUSPEND) */}
      <div className="candidate-profile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} style={{ color: 'var(--color-primary)' }} />
              <span>Gestion des Comptes Utilisateurs ({users.length})</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Activez ou suspendez les comptes Candidats et Entreprises en temps réel.
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={loadUsers} disabled={loadingUsers}>
            <RefreshCw size={14} />
            <span>Actualiser</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--bg-page)',
                borderRadius: '12px',
                border: '1px solid var(--border-default)'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {u.name} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', marginLeft: '6px' }}>({u.role})</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {u.email} {u.phone ? `· ${u.phone}` : ''} · Statut :{' '}
                  <strong style={{ color: u.accountStatus === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {u.accountStatus}
                  </strong>
                </div>
              </div>

              {u.id !== currentUser?.id && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    color: u.accountStatus === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)'
                  }}
                  onClick={() => handleToggleUserStatus(u)}
                >
                  {u.accountStatus === 'ACTIVE' ? (
                    <>
                      <UserX size={14} />
                      <span>Suspendre</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} />
                      <span>Activer</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
