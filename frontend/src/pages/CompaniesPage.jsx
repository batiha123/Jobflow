import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { getPublicCompanyProfiles, resolveApiAssetUrl } from '../services/api';
import { AlertCircle, Building2, Globe, MapPin, RotateCcw, ArrowRight } from 'lucide-react';
import './HomePage.css';

export function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getPublicCompanyProfiles({ signal: controller.signal })
      .then(profiles => setCompanies(Array.isArray(profiles) ? profiles : []))
      .catch(requestError => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Impossible de charger les entreprises.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <div>
      <Navbar />

      <header className="jobs-page-header">
        <div className="container">
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
            Annuaire des Entreprises JobFlow
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Découvrez les profils entreprise publics présents sur JobFlow.
          </p>
        </div>
      </header>

      <div className="container" style={{ padding: '50px 24px 80px 24px' }}>
        {loading && <p role="status">Chargement des entreprises…</p>}

        {!loading && error && (
          <div role="alert" className="company-page-error">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" className="btn-secondary" onClick={() => {
              setLoading(true);
              setError('');
              setReloadKey(key => key + 1);
            }}>
              <RotateCcw size={14} />
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && companies.length === 0 && (
          <div className="company-list-empty">
            <Building2 size={32} />
            <h2>Aucune entreprise à afficher</h2>
            <p>Les profils entreprise apparaîtront ici lorsqu’ils seront créés.</p>
          </div>
        )}

        {!loading && !error && companies.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
            {companies.map(company => {
              const logoUrl = resolveApiAssetUrl(company.logoUrl);
              return (
                <article key={company.id} className="company-card" style={{ padding: '28px' }}>
                  <div className="company-card-top">
                    {logoUrl ? (
                      <img src={logoUrl} alt={`Logo de ${company.companyName}`} className="company-card-logo" style={{ width: '64px', height: '64px' }} />
                    ) : (
                      <div className="company-card-logo company-logo-fallback" style={{ width: '64px', height: '64px' }} aria-hidden="true">
                        <Building2 size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="company-card-title" style={{ fontSize: '1.25rem' }}>{company.companyName}</h3>
                      {company.address && (
                        <div className="company-card-address" style={{ marginTop: '4px' }}>
                          <MapPin size={14} />
                          <span>{company.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {company.description && (
                    <p className="company-card-desc" style={{ WebkitLineClamp: 3, fontSize: '0.92rem' }}>
                      {company.description}
                    </p>
                  )}

                  {company.website && (
                    <div style={{ background: 'var(--bg-surface-alt)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.84rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={14} style={{ color: 'var(--color-primary)' }} />
                        <a href={company.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="company-card-footer">
                    <Link to="/offres" className="stat-cta-link">
                      <span>Voir les offres publiées</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
