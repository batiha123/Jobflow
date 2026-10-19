function Logo({ compact = false }) {
  return (
    <a className={compact ? 'modal-brand' : 'logo'} href="#top" aria-label="JobFlow, accueil">
      <span className="logo-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>Job<span>Flow</span>.</span>
    </a>
  );
}

export default Logo;
