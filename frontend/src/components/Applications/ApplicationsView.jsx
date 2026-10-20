import React, { useState, useEffect } from 'react';
import { db } from '../../data/dbStore';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TestModal } from '../TestModal/TestModal';
import { 
  Calendar, 
  Video, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Award, 
  UserCheck, 
  XCircle, 
  Plus, 
  X,
  ExternalLink,
  Trash2,
  Play
} from 'lucide-react';
import './ApplicationsView.css';

const statusLabels = {
  SUBMITTED: 'Candidature envoyée',
  UNDER_REVIEW: 'En cours d’examen RH',
  SHORTLISTED: 'Entretien visio fixé',
  ACCEPTED: 'Offre acceptée 🎉',
  REJECTED: 'Non retenu',
  WITHDRAWN: 'Candidature retirée'
};

export function ApplicationsView({ onStatusChange }) {
  const { currentUser } = useAuth();
  const isCompany = currentUser?.role === 'COMPANY';

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleModalApp, setScheduleModalApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('2026-03-24T10:00');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/jobflow-interview');
  
  // Interactive Technical Test modal state
  const [activeTestModal, setActiveTestModal] = useState(null);

  const loadData = async () => {
    if (!currentUser) {
      setApplications([]);
      return;
    }
    setIsLoading(true);
    try {
      if (isCompany) {
        setApplications(db.getApplicationsForCompany(currentUser));
      } else {
        // Fetch from real MySQL backend via REST API
        const liveApps = await api.applications.getCandidateApplications(currentUser.id, currentUser);
        if (Array.isArray(liveApps) && liveApps.length > 0) {
          setApplications(liveApps);
        } else {
          // Fallback to local dbStore
          setApplications(db.getApplicationsForCandidate(currentUser));
        }
      }
    } catch (err) {
      console.warn("Connexion API candidatures échouée, fallback local:", err);
      setApplications(db.getApplicationsForCandidate(currentUser));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleUpdateStatus = (appId, newStatus) => {
    db.updateApplicationStatus(appId, newStatus);
    loadData();
    if (onStatusChange) onStatusChange();
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Êtes-vous certain de vouloir retirer votre candidature ?")) {
      return;
    }

    try {
      await api.applications.withdraw(appId, currentUser.id);
    } catch (err) {
      console.warn("Échec du retrait backend, synchronisation locale:", err);
    }

    db.updateApplicationStatus(appId, 'WITHDRAWN');
    loadData();
    if (onStatusChange) onStatusChange();
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    db.scheduleInterview({
      application_id: scheduleModalApp.id,
      scheduled_at: interviewDate,
      location: 'Google Meet',
      meeting_url: meetingUrl,
      notes: 'Entretien RH et technique d’une durée de 45 minutes.'
    });

    db.updateApplicationStatus(scheduleModalApp.id, 'SHORTLISTED');
    setScheduleModalApp(null);
    loadData();
    if (onStatusChange) onStatusChange();
  };

  const handleOpenTest = (app) => {
    setActiveTestModal({
      test: {
        id: app.jobOfferId || app.job_offer_id || 1,
        title: `Évaluation Technique : ${app.jobTitle || app.offer_title || 'Poste Développeur'}`
      },
      application: app
    });
  };

  const handleTestCompleted = (result) => {
    // Update local applications state with score
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === result.applicationId) {
          return {
            ...a,
            testAttempt: {
              score: result.score,
              status: result.status,
              testTitle: 'Test Technique Validé'
            }
          };
        }
        return a;
      })
    );
    loadData();
  };

  return (
    <div className="applications-container">
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-tertiary)' }}>
          Chargement de vos candidatures en temps réel...
        </div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
          <FileText size={40} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Aucune candidature pour le moment</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {isCompany ? "Les candidatures soumises à vos offres apparaîtront ici." : "Postulez aux offres du catalogue pour suivre vos dossiers ici."}
          </p>
        </div>
      ) : (
        applications.map((app) => {
          const title = app.jobTitle || app.offer_title || 'Offre d\'emploi';
          const company = app.companyName || app.company_name || 'Entreprise partenaire';
          const cvUrl = app.cvUrl || app.cv_url;
          const interview = app.interview;
          const scheduledTime = interview?.scheduledAt || interview?.scheduled_at;
          const meetUrl = interview?.meetingUrl || interview?.meeting_url;
          const meetLoc = interview?.location || 'Google Meet';
          const testAttempt = app.testAttempt;

          return (
            <div key={app.id} className="application-card-item">
              <div className="app-card-top-row">
                <div className="app-title-group">
                  <h3>{title}</h3>
                  <div className="app-company-text">{company}</div>
                </div>
                <span className={`app-status-badge status-${app.status}`}>
                  {statusLabels[app.status] || app.status}
                </span>
              </div>

              {/* Visual Stepper */}
              <div className="app-progress-tracker">
                <span className={`progress-step-pill ${['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED'].includes(app.status) ? 'completed' : ''}`}>
                  1. Candidature envoyée
                </span>
                <span>→</span>
                <span className={`progress-step-pill ${['UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED'].includes(app.status) ? 'completed' : app.status === 'SUBMITTED' ? 'current' : ''}`}>
                  2. Examen du dossier
                </span>
                <span>→</span>
                <span className={`progress-step-pill ${['SHORTLISTED', 'ACCEPTED'].includes(app.status) ? 'completed' : app.status === 'UNDER_REVIEW' ? 'current' : ''}`}>
                  3. Entretien visio
                </span>
                <span>→</span>
                <span className={`progress-step-pill ${app.status === 'ACCEPTED' ? 'completed' : ''}`}>
                  4. Décision finale
                </span>
              </div>

              {/* Scheduled Google Meet Alert */}
              {interview && scheduledTime && (
                <div className="app-interview-alert">
                  <div className="app-interview-info">
                    <Calendar size={20} />
                    <div>
                      <div>Entretien fixé le {new Date(scheduledTime).toLocaleDateString('fr-FR')} à {new Date(scheduledTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Plateforme : {meetLoc}</div>
                    </div>
                  </div>
                  {meetUrl && (
                    <a
                      href={meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-join-meet"
                    >
                      <Video size={16} />
                      <span>Rejoindre Google Meet</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="app-card-details-grid">
                <div>
                  <div className="detail-label">Candidat</div>
                  <div className="detail-val">{app.candidateName || app.candidate_name || currentUser?.name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>{app.candidateHeadline || app.candidate_headline || 'Profil vérifié'}</div>
                </div>

                <div>
                  <div className="detail-label">Date de candidature</div>
                  <div className="detail-val" style={{ fontSize: '0.86rem' }}>
                    {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                  </div>
                </div>

                <div>
                  <div className="detail-label">Évaluation Technique</div>
                  <div className="detail-val" style={{ color: testAttempt ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                    <Award size={15} style={{ display: 'inline', marginRight: '4px' }} />
                    {testAttempt ? (
                      <span><strong>{testAttempt.score}%</strong> (Validé)</span>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Non effectuée</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="detail-label">Curriculum Vitae</div>
                  <div className="detail-val">
                    {cvUrl ? (
                      <a 
                        href={cvUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: 'var(--color-primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>Voir mon CV joint</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>Aucun document</span>
                    )}
                  </div>
                </div>
              </div>

              {(app.motivationMessage || app.motivation_message) && (
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: '#fafafc', padding: '12px 16px', borderRadius: '10px', borderLeft: '3px solid var(--color-primary)', marginTop: '14px' }}>
                  "{app.motivationMessage || app.motivation_message}"
                </div>
              )}

              {/* Recruiter Action Bar if logged in as Recruiter */}
              {isCompany && (
                <div className="recruiter-action-bar">
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginRight: 'auto' }}>
                    Actions recruteur pour ce candidat :
                  </span>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    onClick={() => setScheduleModalApp(app)}
                  >
                    <Calendar size={14} />
                    <span>Programmer un Entretien</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px', color: 'var(--color-success)' }}
                    onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                  >
                    <CheckCircle2 size={14} />
                    <span>Accepter le candidat</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px', color: 'var(--color-danger)' }}
                    onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                  >
                    <XCircle size={14} />
                    <span>Refuser</span>
                  </button>
                </div>
              )}

              {/* Candidate Action Bar if logged in as Candidate */}
              {!isCompany && (
                <div className="recruiter-action-bar" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-default)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginRight: 'auto' }}>
                    Actions candidat :
                  </span>

                  {/* Test button */}
                  {!testAttempt && app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                      onClick={() => handleOpenTest(app)}
                    >
                      <Play size={14} />
                      <span>Passer le Test Technique</span>
                    </button>
                  )}

                  {/* Withdraw button */}
                  {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && app.status !== 'ACCEPTED' && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px', color: 'var(--color-danger)' }}
                      onClick={() => handleWithdraw(app.id)}
                    >
                      <Trash2 size={14} />
                      <span>Retirer ma candidature</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Schedule Interview Modal for Recruiter */}
      {scheduleModalApp && (
        <div className="modal-backdrop">
          <div className="job-offer-modal-card">
            <div className="modal-header-row">
              <div>
                <h3 className="modal-title">Planifier un Entretien avec {scheduleModalApp.candidateName || scheduleModalApp.candidate_name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Programmez une session d'échange vidéo avec le candidat.
                </p>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={() => setScheduleModalApp(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group full-width">
                <label className="form-label">
                  <span>Date et Heure du rendez-vous</span>
                </label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <span>Lien de la visioconférence (Google Meet, Zoom, Teams...)</span>
                </label>
                <input 
                  type="url" 
                  className="form-input"
                  required
                  placeholder="https://meet.google.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                />
              </div>

              <div className="form-actions-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setScheduleModalApp(null)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary-save">
                  <Calendar size={16} />
                  <span>Confirmer & Envoyer l'invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Technical Test Modal */}
      {activeTestModal && (
        <TestModal
          test={activeTestModal.test}
          application={activeTestModal.application}
          onClose={() => setActiveTestModal(null)}
          onTestCompleted={handleTestCompleted}
        />
      )}
    </div>
  );
}