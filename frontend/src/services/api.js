/**
 * JobFlow API Client — Ready Template for Backend Integration
 * 
 * Instructions for the team:
 * Once you create your Spring Boot Controllers (in com.team.backend.controller),
 * replace these placeholder methods with actual fetch() or axios calls.
 */

export const BASE_URL = 'http://localhost:8080/api';

export const api = {
  // 1. Authentication (/api/auth)
  auth: {
    /**
     * POST /api/auth/login
     * @param {string} email
     * @param {string} password
     */
    login: async (email, password) => {
      console.log('[API] auth.login placeholder:', { email });
      // TODO: Connect to POST /api/auth/login
      return { id: 1, email, name: email.split('@')[0], role: 'CANDIDATE' };
    },

    /**
     * POST /api/auth/register
     * @param {Object} userData - { name, email, password, role, companyName }
     */
    register: async (userData) => {
      console.log('[API] auth.register placeholder:', userData);
      // TODO: Connect to POST /api/auth/register
      return { id: Date.now(), ...userData };
    }
  },

  // 2. Candidate Profiles & CV (/api/candidates)
  candidates: {
    /**
     * GET /api/candidates/user/{userId}
     */
    getProfile: async (userId) => {
      console.log('[API] candidates.getProfile placeholder for userId:', userId);
      // TODO: Connect to GET /api/candidates/user/{userId}
      return null;
    },

    /**
     * PUT /api/candidates/user/{userId}
     */
    updateProfile: async (userId, profileData) => {
      console.log('[API] candidates.updateProfile placeholder for userId:', userId, profileData);
      // TODO: Connect to PUT /api/candidates/user/{userId}
      return { ...profileData, userId };
    },

    /**
     * POST /api/candidates/upload-cv/{userId}
     */
    uploadCv: async (userId, cvUrl) => {
      console.log('[API] candidates.uploadCv placeholder for userId:', userId, cvUrl);
      // TODO: Connect to POST /api/candidates/upload-cv/{userId}
      return { message: 'CV enregistré', cvUrl };
    }
  },

  // 3. Job Offers (/api/jobs)
  jobs: {
    /**
     * GET /api/jobs?keyword=&location=&contractType=
     */
    getAll: async (params = {}) => {
      console.log('[API] jobs.getAll placeholder with params:', params);
      // TODO: Connect to GET /api/jobs
      return [];
    },

    /**
     * GET /api/jobs/{id}
     */
    getById: async (id) => {
      console.log('[API] jobs.getById placeholder for id:', id);
      // TODO: Connect to GET /api/jobs/{id}
      return null;
    },

    /**
     * POST /api/jobs
     */
    create: async (jobData) => {
      console.log('[API] jobs.create placeholder with:', jobData);
      // TODO: Connect to POST /api/jobs
      return { id: Date.now(), ...jobData };
    },

    /**
     * PUT /api/jobs/{id}
     */
    update: async (id, jobData) => {
      console.log('[API] jobs.update placeholder for id:', id, jobData);
      // TODO: Connect to PUT /api/jobs/{id}
      return { id, ...jobData };
    },

    /**
     * DELETE /api/jobs/{id}
     */
    delete: async (id) => {
      console.log('[API] jobs.delete placeholder for id:', id);
      // TODO: Connect to DELETE /api/jobs/{id}
      return { message: 'Offre supprimée' };
    }
  },

  // 4. Applications (/api/applications)
  applications: {
    /**
     * POST /api/applications/apply
     */
    apply: async ({ userId, jobOfferId, motivationMessage, cvUrl }) => {
      console.log('[API] applications.apply placeholder with:', { userId, jobOfferId, motivationMessage, cvUrl });
      // TODO: Connect to POST /api/applications/apply
      return { id: Date.now(), userId, jobOfferId, status: 'SUBMITTED' };
    },

    /**
     * GET /api/applications/candidate/{userId}
     */
    getCandidateApplications: async (userId) => {
      console.log('[API] applications.getCandidateApplications placeholder for userId:', userId);
      // TODO: Connect to GET /api/applications/candidate/{userId}
      return [];
    },

    /**
     * PUT /api/applications/{id}/withdraw?userId={userId}
     */
    withdraw: async (applicationId, userId) => {
      console.log('[API] applications.withdraw placeholder for appId:', applicationId, userId);
      // TODO: Connect to PUT /api/applications/{id}/withdraw
      return { id: applicationId, status: 'WITHDRAWN' };
    }
  },

  // 5. Technical Assessment Tests (/api/tests)
  tests: {
    /**
     * GET /api/tests
     */
    getAll: async () => {
      // TODO: Connect to GET /api/tests
      return [];
    },

    /**
     * GET /api/tests/job/{jobOfferId}
     */
    getForJob: async (jobOfferId) => {
      // TODO: Connect to GET /api/tests/job/{jobOfferId}
      return [];
    },

    /**
     * POST /api/tests/submit
     */
    submit: async ({ testId, applicationId, score }) => {
      console.log('[API] tests.submit placeholder with:', { testId, applicationId, score });
      // TODO: Connect to POST /api/tests/submit
      return { id: Date.now(), testId, applicationId, score, status: 'COMPLETED' };
    }
  }
};

export default api;
