import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Stats.css';

export function Stats({ stats }) {
  const currentStats = stats || {
    offers: '12 400+',
    companies: '850',
    satisfaction: '92%'
  };

  const partners = [
    { name: 'NovaTech', code: 'NT' },
    { name: 'Lumen Labs', code: 'LL' },
    { name: 'Algolia', code: 'AL' },
    { name: 'Greenly', code: 'GL' },
    { name: 'Mistral AI', code: 'MA' },
    { name: 'Doctolib', code: 'DL' }
  ];

  return (
    <>
      <section className="stats-section">
        <div className="container stats-grid">
          {/* Stat 1 */}
          <div className="stat-item">
            <span className="stat-number">{currentStats.offers}</span>
            <span className="stat-label">offres à découvrir</span>
          </div>

          {/* Stat 2 */}
          <div className="stat-item">
            <span className="stat-number">{currentStats.companies}</span>
            <span className="stat-label">entreprises ambitieuses</span>
          </div>

          {/* Stat 3 */}
          <div className="stat-item">
            <span className="stat-number">{currentStats.satisfaction}</span>
            <span className="stat-label">de talents satisfaits</span>
          </div>

          {/* Call to action */}
          <div className="stat-cta">
            <div className="stat-cta-tag">
              <span className="stat-cta-dot"></span>
              <span>Votre futur vous attend.</span>
            </div>
            <Link to="/tableau-de-bord" className="stat-cta-link">
              <span>Découvrir mon espace</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Partners section */}
      <section className="partners-section">
        <div className="container">
          <div className="partners-heading">
            Ils recrutent leurs futurs talents sur JobFlow
          </div>
          <div className="partners-logos">
            {partners.map((partner, index) => (
              <div key={index} className="partner-logo-item">
                <span className="partner-icon-pill">{partner.code}</span>
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
