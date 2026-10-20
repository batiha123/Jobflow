import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, Award, ArrowRight, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import './TestModal.css';

const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "Dans Spring Boot, quelle annotation permet d'exposer un contrôleur REST renvoyant directement du JSON ?",
    options: [
      { id: 'A', text: "@Controller" },
      { id: 'B', text: "@RestController" },
      { id: 'C', text: "@ResponseBodyService" },
      { id: 'D', text: "@Endpoint" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 2,
    question: "En React, quel Hook est utilisé pour exécuter des effets de bord (comme charger des données d'une API) ?",
    options: [
      { id: 'A', text: "useState" },
      { id: 'B', text: "useContext" },
      { id: 'C', text: "useEffect" },
      { id: 'D', text: "useReducer" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 3,
    question: "Quelle commande SQL permet d'ajouter une contrainte d'unicité sur deux colonnes combinées ?",
    options: [
      { id: 'A', text: "ALTER TABLE t ADD CONSTRAINT uq_col UNIQUE (col1, col2);" },
      { id: 'B', text: "UPDATE TABLE t SET UNIQUE (col1, col2);" },
      { id: 'C', text: "SELECT DISTINCT col1, col2 FROM t;" },
      { id: 'D', text: "INSERT UNIQUE INTO t (col1, col2);" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 4,
    question: "Quelle méthode HTTP est recommandée selon la norme RESTful pour modifier partiellement une ressource existante ?",
    options: [
      { id: 'A', text: "GET" },
      { id: 'B', text: "POST" },
      { id: 'C', text: "PATCH" },
      { id: 'D', text: "DELETE" }
    ],
    correctAnswer: 'C'
  }
];

export function TestModal({ test, application, onClose, onTestCompleted }) {
  const [currentStep, setCurrentStep] = useState(0); // question index
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300s)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, selectedAnswers]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (questionId, optionId) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleFinishTest = async () => {
    let correctCount = 0;
    DEFAULT_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / DEFAULT_QUESTIONS.length) * 100);
    setFinalScore(scorePercentage);
    setIsSubmitted(true);
    setIsSubmitting(true);

    try {
      const testId = test?.id || 1;
      const applicationId = application?.id || 1;
      
      await api.tests.submit({
        testId: testId,
        applicationId: applicationId,
        score: scorePercentage
      });

      if (onTestCompleted) {
        onTestCompleted({
          testId,
          applicationId,
          score: scorePercentage,
          status: 'COMPLETED'
        });
      }
    } catch (err) {
      console.error("Erreur lors de la soumission du test:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = DEFAULT_QUESTIONS[currentStep];
  const allAnswered = DEFAULT_QUESTIONS.every((q) => selectedAnswers[q.id]);

  return (
    <div className="modal-backdrop">
      <div className="test-modal-card">
        {/* Header */}
        <div className="test-modal-header">
          <div>
            <span className="test-badge-type">Évaluation Technique Interactive</span>
            <h2 className="test-modal-title">
              {test?.title || "Test Technique & Bonnes Pratiques Full-Stack"}
            </h2>
            <p className="test-modal-subtitle">
              Offre associée : <strong>{application?.jobTitle || application?.offer_title || "Développeur Full-Stack"}</strong>
            </p>
          </div>

          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!isSubmitted ? (
          <>
            {/* Timer and Progress bar */}
            <div className="test-status-row">
              <div className="test-timer-badge">
                <Clock size={16} />
                <span>Temps restant : {formatTime(timeLeft)}</span>
              </div>
              <div className="test-progress-info">
                Question {currentStep + 1} sur {DEFAULT_QUESTIONS.length}
              </div>
            </div>

            <div className="test-progress-bar-track">
              <div 
                className="test-progress-bar-fill" 
                style={{ width: `${((currentStep + 1) / DEFAULT_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Box */}
            <div className="test-question-box">
              <div className="question-text">
                <HelpCircle size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>{currentQ.question}</span>
              </div>

              <div className="options-grid">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`test-option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    >
                      <div className="option-bullet">{opt.id}</div>
                      <div className="option-label">{opt.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation footer */}
            <div className="test-navigation-footer">
              <button
                type="button"
                className="btn-secondary"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Question précédente
              </button>

              {currentStep < DEFAULT_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                >
                  <span>Suivante</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary-action btn-finish-test"
                  disabled={!allAnswered || isSubmitting}
                  onClick={handleFinishTest}
                >
                  <Award size={16} />
                  <span>{isSubmitting ? "Validation..." : "Valider et Soumettre le Test"}</span>
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results Screen */
          <div className="test-results-container">
            <div className={`score-circle ${finalScore >= 70 ? 'passed' : 'failed'}`}>
              <Award size={40} />
              <div className="score-number">{finalScore}%</div>
            </div>

            <h3 className="score-title">
              {finalScore >= 70 
                ? "Félicitations ! Test validé avec brio !" 
                : "Évaluation terminée"}
            </h3>

            <p className="score-desc">
              {finalScore >= 70
                ? "Votre score a été automatiquement transmis aux recruteurs de l'entreprise. Votre profil est désormais prioritaire pour l'entretien technique !"
                : "Votre score a été enregistré dans votre dossier de candidature."}
            </p>

            <div className="test-score-details-pill">
              <span>Note finale : <strong>{finalScore}%</strong></span>
              <span>Statut : <strong style={{ color: finalScore >= 70 ? '#027a48' : '#b42318' }}>{finalScore >= 70 ? 'Validé (Recommandé)' : 'À perfectionner'}</strong></span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button 
                type="button" 
                className="btn-primary-action"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={onClose}
              >
                Retour à mes candidatures
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}