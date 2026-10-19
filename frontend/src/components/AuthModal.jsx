import { useEffect } from 'react';
import Logo from './Logo';

function AuthModal({ mode, onClose, onSwitch }) {
  const isLogin = mode === 'login';

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="Fermer">×</button>
        <Logo compact />
        <div className="modal-heading">
          <p className="eyebrow">{isLogin ? 'Ravi de vous revoir' : 'Bienvenue dans l’aventure'}</p>
          <h2 id="auth-title">{isLogin ? 'Connectez-vous' : 'Créez votre compte'}</h2>
          <p>{isLogin ? 'Retrouvez les opportunités qui vous ressemblent.' : 'Trouvez le job qui fera la différence.'}</p>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          {!isLogin && <label>Nom complet<input type="text" placeholder="Votre nom" required /></label>}
          <label>Adresse email<input type="email" placeholder="vous@exemple.com" required /></label>
          <label>Mot de passe<input type="password" placeholder="••••••••" required /></label>
          {isLogin && <a className="forgot-link" href="#forgot">Mot de passe oublié ?</a>}
          <button className="primary-button modal-submit" type="submit">
            {isLogin ? 'Se connecter' : 'Créer mon compte'} <span>→</span>
          </button>
        </form>
        <p className="switch-auth">
          {isLogin ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'}{' '}
          <button type="button" onClick={() => onSwitch(isLogin ? 'signup' : 'login')}>
            {isLogin ? 'S’inscrire' : 'Se connecter'}
          </button>
        </p>
      </section>
    </div>
  );
}

export default AuthModal;
