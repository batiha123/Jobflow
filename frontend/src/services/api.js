/**
 * JobFlow API Client — Ready Template for Backend Integration
 * 
 * Instructions for the team:
 * Once you create your Spring Boot Controllers (in com.team.backend.controller),
 * replace these placeholder methods with actual fetch() or axios calls.
 */

export const BASE_URL = '/api';
const TOKEN_STORAGE_KEY = 'jobflow_jwt_token';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || (payload && payload.success === false)) {
    const errorMessage =
      payload?.message ||
      (payload?.data && typeof payload.data === 'object'
        ? Object.values(payload.data).join(', ')
        : null) ||
      `Erreur HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload?.data !== undefined ? payload.data : payload;
}

export const api = {
  // 1. Authentication (/api/auth) — Person 1
  auth: {
    /**
     * POST /api/auth/login
     * @param {string} email
     * @param {string} password
     */
    login: async (email, password) => {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    /**
     * POST /api/auth/register
     * @param {Object} userData - { name, email, password, phone, role, companyName }
     */
    register: async (userData) => {
      return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    }
  },

  // 1b. Users Management (/api/users) — Person 1
  users: {
    getMe: async () => {
      return request('/users/me', { method: 'GET' });
    },
    updateMe: async (userData) => {
      return request('/users/me', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    },
    getAll: async () => {
      return request('/users', { method: 'GET' });
    },
    activate: async (userId) => {
      return request(`/users/${userId}/activate`, { method: 'PATCH' });
    },
    suspend: async (userId) => {
      return request(`/users/${userId}/suspend`, { method: 'PATCH' });
    }
  },

  // 2. Candidate Profiles & CV (/api/candidate-profiles & /api/candidates) — Person 1
  candidates: {
    /**
     * GET /api/candidate-profiles/{userId}
     */
    getProfile: async (userId) => {
      return request(`/candidate-profiles/${userId}`, { method: 'GET' });
    },

    /**
     * PUT /api/candidate-profiles/{userId}
     */
    updateProfile: async (userId, profileData) => {
      return request(`/candidate-profiles/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
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

  // 2b. Admin Profiles (/api/admin-profiles) — Person 1
  adminProfiles: {
    getProfile: async (userId) => {
      return request(`/admin-profiles/${userId}`, { method: 'GET' });
    },
    updateProfile: async (userId, profileData) => {
      return request(`/admin-profiles/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
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
