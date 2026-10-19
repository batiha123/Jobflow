import HeroVisual from './HeroVisual';
import SearchBar from './SearchBar';

function TrustRow() {
  return (
    <div className="trust-row">
      <div className="avatars"><span>👩🏻</span><span>👨🏽</span><span>👩🏼</span><span>👨🏻</span></div>
      <div className="rating">
        <strong>★★★★★</strong> <b>4.9/5</b>
        <small>Déjà 15 000 talents nous font confiance</small>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="pill">✦ &nbsp; Votre avenir, augmenté par l&apos;IA &nbsp; ◈</div>
        <h1>Trouvez votre<br />prochaine<br /><em>opportunité.</em></h1>
        <p className="intro">
          Le bon poste. La bonne équipe. Un nouveau départ.<br />
          Laissez votre talent rencontrer les bonnes opportunités.
        </p>
        <SearchBar />
        <TrustRow />
      </div>
      <HeroVisual />
    </section>
  );
}

export default Hero;
