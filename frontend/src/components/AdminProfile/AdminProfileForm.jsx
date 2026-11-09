import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Save, CheckCircle2, Shield, UserCheck, UserX, RefreshCw, Search, Users } from 'lucide-react';
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
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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
    setProfile((prev) => ({ ...prev, [field]: value }));
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
      if (updated?.name && updateCurrentUserSession) {
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

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const activeCount = users.filter((u) => u.accountStatus === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.accountStatus === 'SUSPENDED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* CARD 1: ADMIN PROFILE */}
      <div className="candidate-profile-card">
        <div className="profile-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div className="profile-title-group">
            <h2>Mon Profil Administrateur</h2>
            <p>Gérez vos informations de responsable plateforme, département et coordonnées.</p>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Shield size={15} />
            <span>Accès Super-Admin JWT</span>
          </span>
        </div>

        {savedSuccess && (
          <div className="save-success-banner">
            <CheckCircle2 size={18} />
            <span>Profil administrateur enregistré avec succès dans MySQL !</span>
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
              <input type="email" className="form-input" disabled value={profile.email} />
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
                <span>Biographie & Responsabilités</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Description de votre rôle et périmètre d'administration..."
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: 'var(--color-primary)' }} />
              <span>Gestion des Comptes Utilisateurs ({users.length})</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Comptes actifs : <strong style={{ color: 'var(--color-success)' }}>{activeCount}</strong> · Comptes suspendus :{' '}
              <strong style={{ color: 'var(--color-danger)' }}>{suspendedCount}</strong>
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={loadUsers} disabled={loadingUsers}>
            <RefreshCw size={14} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Search & Role Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'CANDIDATE', 'COMPANY', 'ADMIN'].map((role) => (
              <button
                key={role}
                type="button"
                className={roleFilter === role ? 'btn-register-pill' : 'btn-secondary'}
                style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                onClick={() => setRoleFilter(role)}
              >
                {role === 'ALL' ? 'Tous' : role}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px 18px',
                background: 'var(--bg-page)',
                borderRadius: '14px',
                border: '1px solid var(--border-default)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800
                  }}
                >
                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{u.name}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      {u.role}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: u.accountStatus === 'ACTIVE' ? '#ecfdf3' : 'var(--color-danger-bg)',
                        color: u.accountStatus === 'ACTIVE' ? '#027a48' : 'var(--color-danger)'
                      }}
                    >
                      {u.accountStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                    {u.email} {u.phone ? `· ${u.phone}` : ''}
                  </div>
                </div>
              </div>

              {u.id !== currentUser?.id && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: u.accountStatus === 'ACTIVE' ? 'var(--color-danger)' : '#027a48',
                    borderColor: u.accountStatus === 'ACTIVE' ? '#fecdca' : '#a6f4c5'
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
