import Logo from './Logo';

function Header({ onOpenModal }) {
  return (
    <header className="site-header">
      <Logo />
      <nav aria-label="Navigation principale">
        <a className="active" href="#top">Accueil</a>
        <a href="#offers">Offres <small>+124</small></a>
        <a href="#companies">Entreprises</a>
        <a href="#about">À propos</a>
      </nav>
      <div className="header-actions">
        <button className="language" type="button">◉ &nbsp;FR⌄</button>
        <button className="login-link" type="button" onClick={() => onOpenModal('login')}>
          Connexion
        </button>
        <button className="primary-button header-signup" type="button" onClick={() => onOpenModal('signup')}>
          S&apos;inscrire <span aria-hidden="true">→</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
