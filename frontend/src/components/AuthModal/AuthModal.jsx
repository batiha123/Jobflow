import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, ArrowRight, Eye, EyeOff, Sparkles, ShieldCheck, Briefcase } from 'lucide-react';
import './AuthModal.css';

export function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Register fields
  const [registerRole, setRegisterRole] = useState('CANDIDATE'); // 'CANDIDATE' | 'COMPANY'
  const [registerName, setRegisterName] = useState('');
  const [registerCompanyName, setRegisterCompanyName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPwd, setShowRegisterPwd] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillDemoAccount = (email) => {
    setMode('login');
    setError('');
    setLoginEmail(email);
    setLoginPassword('Password123!');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (registerPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signup({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone,
        role: registerRole,
        company_name: registerRole === 'COMPANY' ? registerCompanyName : ''
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal-card">
        {/* LEFT PANEL: 3D Visual Career & Security Showcase */}
        <div className="auth-visual-side">
          <div className="auth-visual-orb-1" />
          <div className="auth-visual-orb-2" />

          <div>
            <div className="auth-brand-pill">
              <Sparkles size={14} />
              <span>JOBFLOW 3D TALENT CLOUD</span>
            </div>
            <h2 className="auth-visual-headline">
              Propulsez votre carrière & vos recrutements.
            </h2>
            <p className="auth-visual-subtext">
              Plateforme intelligente avec authentification JWT sécurisée, gestion de profils enrichis et suivi en temps réel.
            </p>
          </div>

          <div className="auth-3d-scene">
            <div className="auth-3d-floating-card">
              <div className="auth-3d-icon-cube">
                <Briefcase size={20} color="#ffffff" />
              </div>
              <div>
                <div className="auth-3d-card-title">Profils Candidats & CV</div>
                <div className="auth-3d-card-meta">Matching compétences & suivi instantané</div>
              </div>
            </div>

            <div className="auth-3d-floating-card">
              <div className="auth-3d-icon-cube">
                <ShieldCheck size={20} color="#ffffff" />
              </div>
              <div>
                <div className="auth-3d-card-title">Sécurité BCrypt & JWT</div>
                <div className="auth-3d-card-meta">Accès par rôles Candidat, Recruteur & Admin</div>
              </div>
            </div>
          </div>

          <div className="auth-demo-box">
            <span className="auth-demo-label">Accès rapide démo (1 clic) :</span>
            <div className="auth-demo-pills">
              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => fillDemoAccount('yasmine.benali@gmail.com')}
              >
                👩‍💻 Candidat
              </button>
              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => fillDemoAccount('sophie.mercier@novatech.io')}
              >
                🏢 Entreprise
              </button>
              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => fillDemoAccount('admin@jobflow.com')}
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form Card */}
        <div className="auth-form-side">
          <button
            type="button"
            className="btn-close-modal"
            style={{ position: 'absolute', top: '18px', right: '18px' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>

          <div className="auth-form-header">
            <h3>{mode === 'login' ? 'Bon retour parmi nous 👋' : 'Créer votre compte JobFlow'}</h3>
            <p>
              {mode === 'login'
                ? 'Connectez-vous pour accéder à votre espace personnel.'
                : 'Rejoignez la plateforme en quelques secondes.'}
            </p>
          </div>

          {/* Tab switcher: Connexion vs S'inscrire */}
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              S'inscrire
            </button>
          </div>

          {error && <div className="auth-error-msg">{error}</div>}

          {/* FORM 1: CONNEXION */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <span>Adresse email</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="votre.email@exemple.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Mot de passe</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    type={showLoginPwd ? 'text' : 'password'}
                    className="form-input"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-pwd-toggle"
                    onClick={() => setShowLoginPwd((v) => !v)}
                    title={showLoginPwd ? 'Masquer' : 'Afficher'}
                  >
                    {showLoginPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '12px 0 18px 0',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <input type="checkbox" id="rememberMe" defaultChecked />
                <label htmlFor="rememberMe">Se souvenir de moi</label>
              </div>

              <button
                type="submit"
                className="btn-register-pill auth-submit-3d"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Connexion en cours...' : 'Se connecter'}</span>
                <ArrowRight size={16} />
              </button>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: '16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-tertiary)'
                }}
              >
                Vous n'avez pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    textDecoration: 'underline'
                  }}
                >
                  Créer un compte
                </button>
              </div>
            </form>
          )}

          {/* FORM 2: S'INSCRIRE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="role-choice-grid">
                <div
                  className={`role-choice-card ${registerRole === 'CANDIDATE' ? 'selected' : ''}`}
                  onClick={() => setRegisterRole('CANDIDATE')}
                >
                  <div className="role-choice-card-icon">👩‍💻</div>
                  <div className="role-choice-card-title">Candidat</div>
                  <div className="role-choice-card-desc">Je recherche un poste</div>
                </div>

                <div
                  className={`role-choice-card ${registerRole === 'COMPANY' ? 'selected' : ''}`}
                  onClick={() => setRegisterRole('COMPANY')}
                >
                  <div className="role-choice-card-icon">🏢</div>
                  <div className="role-choice-card-title">Entreprise</div>
                  <div className="role-choice-card-desc">Je recrute des talents</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>
                    {registerRole === 'COMPANY'
                      ? 'Nom du contact RH / Représentant'
                      : 'Nom et Prénom'}
                  </span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder={
                      registerRole === 'COMPANY' ? 'Ex: Sophie Mercier' : 'Ex: Marie Dubois'
                    }
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>
              </div>

              {registerRole === 'COMPANY' && (
                <div className="form-group">
                  <label className="form-label">
                    <span>Nom de votre entreprise</span>
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Ex: Nova Studio, Greenly..."
                      value={registerCompanyName}
                      onChange={(e) => setRegisterCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <span>Email {registerRole === 'COMPANY' ? 'professionnel' : ''}</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="nom@exemple.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Téléphone (optionnel)</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+33 6 12 34 56 78"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Mot de passe</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    type={showRegisterPwd ? 'text' : 'password'}
                    className="form-input"
                    required
                    minLength={6}
                    placeholder="Au moins 6 caractères"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-pwd-toggle"
                    onClick={() => setShowRegisterPwd((v) => !v)}
                    title={showRegisterPwd ? 'Masquer' : 'Afficher'}
                  >
                    {showRegisterPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-register-pill auth-submit-3d"
                disabled={isSubmitting}
                style={{ marginTop: '8px' }}
              >
                <span>
                  {isSubmitting
                    ? 'Création en cours...'
                    : `Créer mon compte ${registerRole === 'COMPANY' ? 'Entreprise' : 'Candidat'}`}
                </span>
                <ArrowRight size={16} />
              </button>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: '14px',
                  fontSize: '0.85rem',
                  color: 'var(--text-tertiary)'
                }}
              >
                Vous possédez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    textDecoration: 'underline'
                  }}
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
