import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { db } from '../data/dbStore';
import { api } from '../services/api';
import { Building2, MapPin, Globe, Mail, Phone, ArrowRight } from 'lucide-react';
import './HomePage.css';

export function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true);
      try {
        const liveCompanies = await api.companies.getAll();
        if (Array.isArray(liveCompanies) && liveCompanies.length > 0) {
          setCompanies(liveCompanies);
        } else {
          setCompanies(db.getCompanyProfiles());
        }
      } catch (err) {
        console.warn("Échec chargement annuaire entreprises API:", err);
        setCompanies(db.getCompanyProfiles());
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
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
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
            Chargement des entreprises...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
            {companies.map((comp) => {
              const name = comp.companyName || comp.company_name;
              const logo = comp.logoUrl || comp.logo_url;
              const address = comp.address || 'France';
              const description = comp.description || 'Entreprise tech partenaire de la plateforme JobFlow.';
              const website = comp.website;
              const email = comp.contactEmail || comp.contact_email;
              const phone = comp.contactPhone || comp.contact_phone;

              return (
                <div key={comp.id} className="company-card" style={{ padding: '28px' }}>
                  <div className="company-card-top">
                    {logo ? (
                      <img src={logo} alt={name} className="company-card-logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                    ) : (
                      <div className="company-card-logo" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.4rem' }}>
                        {name ? name.charAt(0) : 'E'}
                      </div>
                    )}
                    <div>
                      <h3 className="company-card-title" style={{ fontSize: '1.25rem' }}>{name}</h3>
                      <div className="company-card-address" style={{ marginTop: '4px' }}>
                        <MapPin size={14} />
                        <span>{address}</span>
                      </div>
                    </div>
                  </div>

                  <p className="company-card-desc" style={{ WebkitLineClamp: 3, fontSize: '0.92rem' }}>
                    {description}
                  </p>

                  <div style={{ background: 'var(--bg-surface-alt)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={14} style={{ color: 'var(--color-primary)' }} />
                        <a href={website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                          {website}
                        </a>
                      </div>
                    )}
                    {email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Mail size={14} />
                        <span>{email}</span>
                      </div>
                    )}
                    {phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Phone size={14} />
                        <span>{phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="company-card-footer">
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                      Recrute activement
                    </span>
                    <Link to="/offres" className="stat-cta-link">
                      <span>Voir les offres</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
