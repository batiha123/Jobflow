import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, ArrowRight } from 'lucide-react';
import './AuthModal.css';

export function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [registerRole, setRegisterRole] = useState('CANDIDATE'); // 'CANDIDATE' | 'COMPANY'
  const [registerName, setRegisterName] = useState('');
  const [registerCompanyName, setRegisterCompanyName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signup({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
        company_name: registerRole === 'COMPANY' ? registerCompanyName : ''
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal-card">
        {/* Close Button */}
        <button 
          type="button" 
          className="btn-close-modal" 
          style={{ position: 'absolute', top: '20px', right: '20px' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Tab switcher: Connexion vs S'inscrire */}
        <div className="auth-tab-switch">
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Connexion
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
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
              <input 
                type="email"
                className="form-input"
                required
                placeholder="votre.email@exemple.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  <span>Mot de passe</span>
                </label>
              </div>
              <input 
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 20px 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" id="rememberMe" defaultChecked />
              <label htmlFor="rememberMe">Se souvenir de moi</label>
            </div>

            <button 
              type="submit" 
              className="btn-register-pill"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              <span>{isSubmitting ? 'Connexion en cours...' : 'Se connecter'}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Vous n'avez pas encore de compte ?{' '}
              <button 
                type="button" 
                onClick={() => setMode('register')} 
                style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
              >
                Créer un compte
              </button>
            </div>
          </form>
        )}

        {/* FORM 2: S'INSCRIRE */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            {/* Account Type Selection */}
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
                <span>{registerRole === 'COMPANY' ? 'Nom du contact RH / Représentant' : 'Nom et Prénom'}</span>
              </label>
              <input 
                type="text"
                className="form-input"
                required
                placeholder={registerRole === 'COMPANY' ? 'Ex: Sophie Mercier' : 'Ex: Marie Dubois'}
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
            </div>

            {registerRole === 'COMPANY' && (
              <div className="form-group">
                <label className="form-label">
                  <span>Nom de votre entreprise</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ex: Nova Studio, Greenly..."
                  value={registerCompanyName}
                  onChange={(e) => setRegisterCompanyName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <span>Email {registerRole === 'COMPANY' ? 'professionnel' : ''}</span>
              </label>
              <input 
                type="email"
                className="form-input"
                required
                placeholder="nom@exemple.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Mot de passe</span>
              </label>
              <input 
                type="password"
                className="form-input"
                required
                placeholder="Au moins 6 caractères"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn-register-pill"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px' }}
            >
              <span>{isSubmitting ? 'Création en cours...' : `Créer mon compte ${registerRole === 'COMPANY' ? 'Entreprise' : 'Candidat'}`}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Vous possédez déjà un compte ?{' '}
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
              >
                Se connecter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
