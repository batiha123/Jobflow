function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="Une professionnelle qui travaille sur son ordinateur">
      <div className="sparkle sparkle-one">✦</div>
      <div className="sparkle sparkle-two">✦</div>
      <div className="photo-frame">
        <div className="photo-glow" />
        <div className="person">
          <div className="hair" />
          <div className="face"><span className="smile">⌣</span></div>
          <div className="neck" />
          <div className="shirt" />
          <div className="laptop"><span>⌘</span></div>
        </div>
      </div>
      <div className="floating-card cv-card">
        <span className="card-icon">▣</span>
        <span><strong>CV analysé</strong><small>Le match parfait existe.</small></span>
        <b>92 %</b>
      </div>
      <div className="floating-card calendar-card">
        <span className="card-icon purple">▦</span>
        <span><strong>Entretien demain</strong><small>10:00 · Google Meet</small></span>
        <b>⌕</b>
      </div>
      <div className="floating-card accepted-card">
        <span className="card-icon green">✓</span>
        <span><strong>Offre acceptée 🎉</strong><small>Le début d&apos;une belle aventure.</small></span>
      </div>
      <span className="visual-caption">✧ Moins de hasard. Plus de possibilités.</span>
    </div>
  );
}

export default HeroVisual;
