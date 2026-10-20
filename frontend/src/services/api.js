/**
 * JobFlow API Client
 * Communicates with the real Spring Boot backend via /api (port 8080)
 * Gracefully falls back to dbStore if offline.
 */
import { db } from '../data/dbStore';

const BASE_URL = '/api';

async function request(endpoint, options = {}, fallbackFn) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (res.ok) {
      return await res.json();
    }

    // Try to parse error message from Spring Boot
    const errorBody = await res.json().catch(() => null);
    if (errorBody && errorBody.message) {
      throw new Error(errorBody.message);
    }
    throw new Error(`Erreur serveur (${res.status})`);
  } catch (err) {
    // If it's a specific validation message from backend, propagate it
    if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
      throw err;
    }
    // Network offline fallback
    if (fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // 1. Candidate Profile & CV
  candidates: {
    getProfile: (userId) => 
      request(`/candidates/user/${userId}`, { method: 'GET' }, () => db.getCandidateProfileByUser({ id: userId })),
    
    updateProfile: (userId, profileData) => 
      request(`/candidates/user/${userId}`, { method: 'PUT', body: JSON.stringify(profileData) }, () => db.updateCandidateProfileByUser({ id: userId }, profileData)),
    
    uploadCv: (userId, cvUrl) => 
      request(`/candidates/upload-cv/${userId}`, { method: 'POST', body: JSON.stringify({ cvUrl }) }, () => ({ message: 'CV enregistré', cvUrl }))
  },

  // 2. Job Offers
  jobs: {
    getAll: (params = {}) => {
      const q = new URLSearchParams();
      if (params.keyword) q.set('keyword', params.keyword);
      if (params.location) q.set('location', params.location);
      if (params.contractType) q.set('contractType', params.contractType);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/jobs${queryStr}`, { method: 'GET' }, () => db.getJobOffers());
    },

    getById: (id) => 
      request(`/jobs/${id}`, { method: 'GET' }, () => db.getJobOffers().find(o => o.id === Number(id))),

    create: (user, jobData) => 
      request('/jobs', { method: 'POST', body: JSON.stringify(jobData) }, () => db.createJobOfferForCompany(user, jobData)),

    update: (id, jobData) => 
      request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(jobData) }, () => db.updateJobOffer(id, jobData)),

    delete: (id) => 
      request(`/jobs/${id}`, { method: 'DELETE' }, () => db.deleteJobOffer(id))
  },

  // 3. Applications & Workflow
  applications: {
    apply: ({ userId, jobOfferId, motivationMessage, cvUrl }) => 
      request('/applications/apply', { 
        method: 'POST', 
        body: JSON.stringify({ userId, jobOfferId, motivationMessage, cvUrl }) 
      }, () => db.submitApplication({ candidate_id: userId, job_offer_id: jobOfferId, motivation_message: motivationMessage, cv_url: cvUrl })),

    getCandidateApplications: (userId, userObj) => 
      request(`/applications/candidate/${userId}`, { method: 'GET' }, () => db.getApplicationsForCandidate(userObj || { id: userId })),

    withdraw: (applicationId, userId) => 
      request(`/applications/${applicationId}/withdraw?userId=${userId}`, { method: 'PUT' }, () => {
        db.updateApplicationStatus(applicationId, 'WITHDRAWN');
        return { id: applicationId, status: 'WITHDRAWN' };
      })
  },

  // 4. Assessment Tests
  tests: {
    getAll: () => 
      request('/tests', { method: 'GET' }, () => []),

    getForJob: (jobOfferId) => 
      request(`/tests/job/${jobOfferId}`, { method: 'GET' }, () => []),

    submit: ({ testId, applicationId, score }) => 
      request('/tests/submit', { 
        method: 'POST', 
        body: JSON.stringify({ testId, applicationId, score }) 
      }, () => ({ id: 1, testId, score, status: 'COMPLETED' }))
  }
};

export default api;
