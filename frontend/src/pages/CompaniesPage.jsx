import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { db } from '../data/dbStore';
import { Building2, MapPin, Globe, Mail, Phone, ArrowRight } from 'lucide-react';
import './HomePage.css';

export function CompaniesPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    setCompanies(db.getCompanyProfiles());
  }, []);

  return (
    <div>
      <Navbar />

      <header className="jobs-page-header">
        <div className="container">
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
            Annuaire des Entreprises Recruteuses
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Découvrez les entreprises innovantes qui recrutent activement des talents tech sur JobFlow.
          </p>
        </div>
      </header>

      <div className="container" style={{ padding: '50px 24px 80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
          {companies.map((comp) => (
            <div key={comp.id} className="company-card" style={{ padding: '28px' }}>
              <div className="company-card-top">
                <img src={comp.logo_url} alt={comp.company_name} className="company-card-logo" style={{ width: '64px', height: '64px' }} />
                <div>
                  <h3 className="company-card-title" style={{ fontSize: '1.25rem' }}>{comp.company_name}</h3>
                  <div className="company-card-address" style={{ marginTop: '4px' }}>
                    <MapPin size={14} />
                    <span>{comp.address}</span>
                  </div>
                </div>
              </div>

              <p className="company-card-desc" style={{ WebkitLineClamp: 3, fontSize: '0.92rem' }}>
                {comp.description}
              </p>

              <div style={{ background: 'var(--bg-surface-alt)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {comp.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={14} style={{ color: 'var(--color-primary)' }} />
                    <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                      {comp.website}
                    </a>
                  </div>
                )}
                {comp.contact_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Mail size={14} />
                    <span>{comp.contact_email}</span>
                  </div>
                )}
                {comp.contact_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Phone size={14} />
                    <span>{comp.contact_phone}</span>
                  </div>
                )}
              </div>

              <div className="company-card-footer">
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                  {comp.active_offers_count || 1} offre(s) active(s)
                </span>
                <Link to="/offres" className="stat-cta-link">
                  <span>Voir les offres</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
