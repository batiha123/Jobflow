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

  // 2. Company Profile
  companies: {
    getAll: () => 
      request('/companies', { method: 'GET' }, () => db.getCompanyProfiles()),

    getById: (id) => 
      request(`/companies/${id}`, { method: 'GET' }, () => db.getCompanyProfiles().find(c => c.id === Number(id))),

    getProfile: (userId) => 
      request(`/companies/user/${userId}`, { method: 'GET' }, () => db.getCompanyProfileByUser({ id: userId })),

    updateProfile: (userId, data) => 
      request(`/companies/user/${userId}`, { method: 'PUT', body: JSON.stringify(data) }, () => db.updateCompanyProfileByUser({ id: userId }, data))
  },

  // 3. Job Offers
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

    getCompanyOffers: (userId) => 
      request(`/jobs/company/${userId}`, { method: 'GET' }, () => db.getJobOffersForCompany({ id: userId })),

    create: (userId, jobData) => 
      request(`/jobs?userId=${userId}`, { method: 'POST', body: JSON.stringify(jobData) }, () => db.createJobOfferForCompany({ id: userId }, jobData)),

    update: (id, userId, jobData) => 
      request(`/jobs/${id}?userId=${userId}`, { method: 'PUT', body: JSON.stringify(jobData) }, () => db.updateJobOffer(id, jobData)),

    delete: (id, userId) => 
      request(`/jobs/${id}?userId=${userId}`, { method: 'DELETE' }, () => db.deleteJobOffer(id))
  },

  // 4. Applications & Workflow
  applications: {
    apply: ({ userId, jobOfferId, motivationMessage, cvUrl }) => 
      request('/applications/apply', { 
        method: 'POST', 
        body: JSON.stringify({ userId, jobOfferId, motivationMessage, cvUrl }) 
      }, () => db.submitApplication({ candidate_id: userId, job_offer_id: jobOfferId, motivation_message: motivationMessage, cv_url: cvUrl })),

    getCandidateApplications: (userId, userObj) => 
      request(`/applications/candidate/${userId}`, { method: 'GET' }, () => db.getApplicationsForCandidate(userObj || { id: userId })),

    getCompanyApplications: (userId, userObj) => 
      request(`/applications/company/${userId}`, { method: 'GET' }, () => db.getApplicationsForCompany(userObj || { id: userId })),

    updateStatus: (id, status) => 
      request(`/applications/${id}/status?status=${status}`, { method: 'PUT' }, () => db.updateApplicationStatus(id, status)),

    scheduleInterview: (id, interviewData) => 
      request(`/applications/${id}/interview`, { method: 'POST', body: JSON.stringify(interviewData) }, () => db.scheduleInterview({ application_id: id, ...interviewData })),

    withdraw: (applicationId, userId) => 
      request(`/applications/${applicationId}/withdraw?userId=${userId}`, { method: 'PUT' }, () => {
        db.updateApplicationStatus(applicationId, 'WITHDRAWN');
        return { id: applicationId, status: 'WITHDRAWN' };
      })
  },

  // 5. Assessment Tests
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
  },

  // 6. Administrator & Moderation
  admin: {
    getStats: () => 
      request('/admin/stats', { method: 'GET' }, () => ({
        totalUsers: db.getUsers().length,
        candidateUsers: db.getUsers().filter(u => u.role === 'CANDIDATE').length,
        companyUsers: db.getUsers().filter(u => u.role === 'COMPANY').length,
        totalOffers: db.getJobOffers().length,
        publishedOffers: db.getJobOffers().length,
        totalApplications: 4,
        totalInterviews: 1,
        pendingReports: 1
      })),

    getUsers: () => 
      request('/admin/users', { method: 'GET' }, () => db.getUsers().map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        accountStatus: 'ACTIVE',
        createdAt: '2026-01-01T08:00:00'
      }))),

    updateUserStatus: (id, status) => 
      request(`/admin/users/${id}/status?status=${status}`, { method: 'PUT' }, () => ({ id, status })),

    deleteUser: (id) => 
      request(`/admin/users/${id}`, { method: 'DELETE' }, () => ({ message: 'Utilisateur supprimé' })),

    getReports: () => 
      request('/admin/reports', { method: 'GET' }, () => [
        {
          id: 1,
          jobOfferId: 3,
          jobOfferTitle: "Lead Tech Java 21 & Microservices",
          companyName: "NovaTech Solutions",
          userName: "Thomas Dubois",
          userEmail: "thomas.dubois@gmail.com",
          reason: "Information de salaire à préciser",
          description: "La fourchette de salaire annoncée semble incohérente avec les responsabilités requises.",
          status: "PENDING",
          reportDate: "2026-03-15T10:30:00"
        }
      ]),

    reportJob: (offerId, userId, reason, description) => 
      request(`/admin/reports/submit?offerId=${offerId}&userId=${userId || 1}&reason=${encodeURIComponent(reason)}&description=${encodeURIComponent(description || '')}`, { method: 'POST' }),

    resolveReport: (id, status, deleteOffer) => 
      request(`/admin/reports/${id}/resolve?status=${status}&deleteOffer=${deleteOffer || false}`, { method: 'PUT' })
  }
};

export default api;
