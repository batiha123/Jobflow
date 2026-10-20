import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  FileCheck2, 
  Calendar, 
  Check, 
  Video 
} from 'lucide-react';
import './Hero.css';

export function Hero({ onSearch }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ keyword, location });
    } else {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (location) params.set('location', location);
      navigate(`/offres?${params.toString()}`);
    }
  };

  const handleTagClick = (tag) => {
    setKeyword(tag);
    navigate(`/offres?keyword=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        {/* Left Column: Headlines & Search */}
        <div className="hero-content">
          {/* Pill Badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span>Votre avenir, augmenté par l'IA</span>
            <Sparkles size={14} />
          </div>

          {/* Main Title */}
          <h1 className="hero-title">
            Trouvez votre<br />
            prochaine<br />
            <span className="hero-title-gradient">opportunité.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Le bon poste. La bonne équipe. Un nouveau départ.<br />
            Laissez votre talent rencontrer les bonnes opportunités.
          </p>

          {/* Dual Search Pill */}
          <form className="hero-search-box" onSubmit={handleSubmit}>
            <div className="search-field">
              <Search size={18} className="search-field-icon" />
              <input 
                type="text" 
                placeholder="Poste, compétence..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="search-divider"></div>

            <div className="search-field">
              <MapPin size={18} className="search-field-icon" />
              <input 
                type="text" 
                placeholder="Où ?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-search-submit">
              <Search size={16} />
              <span>Rechercher</span>
            </button>
          </form>

          {/* Popular Search Tags */}
          <div className="hero-popular">
            <span>Populaire :</span>
            <button type="button" className="popular-tag" onClick={() => handleTagClick('Product Designer')}>
              <span>Product Designer</span>
              <ArrowRight size={13} />
            </button>
            <button type="button" className="popular-tag" onClick={() => handleTagClick('React')}>
              <span>React</span>
              <ArrowRight size={13} />
            </button>
            <button type="button" className="popular-tag" onClick={() => handleTagClick('Data Analyst')}>
              <span>Data Analyst</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Social Proof Avatars & 4.9/5 Rating */}
          <div className="hero-social-proof">
            <div className="avatar-stack">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Talent 1" 
                className="avatar-stack-item"
              />
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Talent 2" 
                className="avatar-stack-item"
              />
              <img 
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Talent 3" 
                className="avatar-stack-item"
              />
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Talent 4" 
                className="avatar-stack-item"
              />
            </div>

            <div className="hero-rating-info">
              <div className="rating-stars">
                <span className="stars-icons">★★★★★</span>
                <span>4.9/5</span>
              </div>
              <span className="rating-subtitle">Déjà 15 000 talents nous font confiance</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual with 3 Floating Cards */}
        <div className="hero-visual-wrapper">
          {/* Main Photo Frame */}
          <div className="hero-main-photo-frame">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" 
              alt="Professionnelle au travail" 
              className="hero-main-photo"
            />
          </div>

          {/* Floating Card 1: CV analysé 92% (Top Left) */}
          <div className="floating-card-cv">
            <div className="floating-icon-cv">
              <FileCheck2 size={22} />
            </div>
            <div>
              <div className="floating-card-title">CV analysé ✓</div>
              <div className="floating-card-desc">Le match parfait existe.</div>
            </div>
            <div className="cv-score-circle">
              92%
            </div>
          </div>

          {/* Floating Card 2: Entretien demain (Bottom Right) */}
          <div className="floating-card-interview">
            <div className="floating-icon-calendar">
              <Calendar size={20} />
            </div>
            <div>
              <div className="floating-card-agenda-tag">À votre agenda</div>
              <div className="floating-card-title">Entretien demain</div>
              <div className="floating-card-meet-tag">10:00 · Google Meet</div>
            </div>
            <div className="floating-meet-btn" title="Lien Visio">
              <Video size={16} />
            </div>
          </div>

          {/* Floating Card 3: Offre acceptée (Bottom Left) */}
          <div className="floating-card-offer">
            <div className="floating-icon-check">
              <Check size={20} />
            </div>
            <div>
              <div className="floating-card-title">Offre acceptée 🎉</div>
              <div className="floating-card-desc">Le début d'une belle aventure.</div>
            </div>
          </div>

          {/* Slogan Underneath */}
          <div className="hero-visual-footer">
            <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
            <span>Moins de hasard. Plus de possibilités.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
