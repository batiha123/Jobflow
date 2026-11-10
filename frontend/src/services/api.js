/**
 * JobFlow API Client — Ready Template for Backend Integration
 * 
 * Instructions for the team:
 * Once you create your Spring Boot Controllers (in com.team.backend.controller),
 * replace these placeholder methods with actual fetch() or axios calls.
 */

export const BASE_URL = '/api';
const TOKEN_STORAGE_KEY = 'jobflow_jwt_token';

const STATUS_MESSAGES_FR = {
  400: 'Les informations saisies sont invalides. Veuillez vérifier vos champs.',
  401: 'Identifiants incorrects ou session expirée. Veuillez vous reconnecter.',
  403: "Accès refusé. Vous n'avez pas les droits nécessaires pour cette action.",
  404: 'Aucun compte ou élément correspondant trouvé.',
  409: 'Ce compte ou cet email existe déjà.',
  500: 'Une erreur interne est survenue sur le serveur.',
  502: 'Le serveur backend redémarre ou est inaccessible. Réessayez dans un instant.',
  503: 'Service temporairement indisponible. Veuillez réessayer.'
};

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      'Impossible de contacter le serveur JobFlow. Vérifiez que le backend Spring Boot est bien démarré.'
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || (payload && payload.success === false)) {
    const validationDetails =
      payload?.data && typeof payload.data === 'object'
        ? Object.values(payload.data).join(' • ')
        : null;

    const errorMessage =
      validationDetails ||
      payload?.message ||
      STATUS_MESSAGES_FR[response.status] ||
      'Une erreur est survenue lors du traitement de votre demande.';
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
  },

  // 6. Notifications (/api/notifications) — Person 4
  notifications: {
    getUserNotifications: async (userId) => {
      try {
        const res = await fetch(`${BASE_URL}/notifications/user/${userId}`);
        const json = await res.json();
        return json.data || [];
      } catch (err) {
        console.error('[API] Failed to fetch notifications:', err);
        return [];
      }
    },
    getUnreadCount: async (userId) => {
      try {
        const res = await fetch(`${BASE_URL}/notifications/user/${userId}/unread-count`);
        const json = await res.json();
        return json.data || 0;
      } catch (err) {
        console.error('[API] Failed to fetch unread count:', err);
        return 0;
      }
    },
    markAsRead: async (id) => {
      try {
        const res = await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PATCH' });
        return await res.json();
      } catch (err) {
        console.error('[API] Failed to mark notification as read:', err);
        return null;
      }
    },
    create: async (userId, message) => {
      try {
        const res = await fetch(`${BASE_URL}/notifications?userId=${userId}&message=${encodeURIComponent(message)}`, {
          method: 'POST'
        });
        return await res.json();
      } catch (err) {
        console.error('[API] Failed to create notification:', err);
        return null;
      }
    }
  },

  // 7. Job Offer Reports (/api/reports) — Person 4
  reports: {
    create: async ({ userId, jobOfferId, reason, description }) => {
      try {
        const res = await fetch(`${BASE_URL}/reports?userId=${userId}&jobOfferId=${jobOfferId}&reason=${encodeURIComponent(reason)}&description=${encodeURIComponent(description || '')}`, {
          method: 'POST'
        });
        return await res.json();
      } catch (err) {
        console.error('[API] Failed to submit report:', err);
        return null;
      }
    },
    getAll: async (status = '') => {
      try {
        const url = status ? `${BASE_URL}/reports?status=${status}` : `${BASE_URL}/reports`;
        const res = await fetch(url);
        const json = await res.json();
        return json.data || [];
      } catch (err) {
        console.error('[API] Failed to fetch reports:', err);
        return [];
      }
    },
    updateStatus: async (reportId, status) => {
      try {
        const res = await fetch(`${BASE_URL}/reports/${reportId}/status?status=${status}`, {
          method: 'PATCH'
        });
        return await res.json();
      } catch (err) {
        console.error('[API] Failed to update report status:', err);
        return null;
      }
    },
    getPendingCount: async () => {
      try {
        const res = await fetch(`${BASE_URL}/reports/pending-count`);
        const json = await res.json();
        return json.data || 0;
      } catch (err) {
        console.error('[API] Failed to fetch pending report count:', err);
        return 0;
      }
    }
  },

  // 8. Admin Platform Stats & Audit (/api/admin) — Person 4
  admin: {
    getStats: async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/stats`);
        const json = await res.json();
        return json.data || { totalUsers: 0, activeJobOffers: 0, totalApplications: 0, pendingReports: 0 };
      } catch (err) {
        console.error('[API] Failed to fetch admin stats:', err);
        return { totalUsers: 0, activeJobOffers: 0, totalApplications: 0, pendingReports: 0 };
      }
    },
    getAuditLogs: async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/audit-logs`);
        const json = await res.json();
        return json.data || [];
      } catch (err) {
        console.error('[API] Failed to fetch audit logs:', err);
        return [];
      }
    },
    logAction: async ({ adminUserId, action, targetType, targetId, details }) => {
      try {
        const url = `${BASE_URL}/admin/audit-logs?adminUserId=${adminUserId}&action=${encodeURIComponent(action)}&targetType=${encodeURIComponent(targetType)}&targetId=${targetId || ''}&details=${encodeURIComponent(details || '')}`;
        const res = await fetch(url, { method: 'POST' });
        return await res.json();
      } catch (err) {
        console.error('[API] Failed to log admin action:', err);
        return null;
      }
    }
  },

  // 9. Google Gemini AI Analysis (/api/ai) — Person 4
  ai: {
    analyzeCv: async (candidateSkills, jobRequirements) => {
      try {
        const res = await fetch(`${BASE_URL}/ai/analyze-cv`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateSkills, jobRequirements })
        });
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.error('[API] Failed to run AI CV analysis:', err);
        return null;
      }
    }
  }
};

export default api;
