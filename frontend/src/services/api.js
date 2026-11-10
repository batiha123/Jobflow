const DEFAULT_API_URL = 'http://localhost:8080/api';
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_LOGO_EXTENSIONS = /\.(png|jpe?g)$/i;

export const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
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
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}/${endpoint.replace(/^\/+/, '')}`;
    response = await fetch(url, {
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

export function resolveApiAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const apiUrl = new URL(BASE_URL, window.location.origin);
  return new URL(path.replace(/^\/+/, ''), apiUrl.origin + '/').toString();
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let requestBody;
  if (isFormData) {
    requestHeaders.delete('Content-Type');
    requestBody = body;
  } else if (body !== undefined) {
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }
    requestBody = JSON.stringify(body);
  }

  let response;
  try {
    const url = path.startsWith('http') ? path : `${BASE_URL}/${path.replace(/^\/+/, '')}`;
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal
    });
  } catch (cause) {
    if (cause?.name === 'AbortError') {
      throw cause;
    }

    const error = new Error('Impossible de contacter le serveur API. Vérifiez votre connexion.');
    error.cause = cause;
    throw error;
  }

  const responseText = await response.text();
  let responseData = null;
  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    const message = getErrorMessage(responseData, response.status);
    const error = new Error(message);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
}

function getErrorMessage(responseData, status) {
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }

  return `La requête a échoué (HTTP ${status}).`;
}

function buildQuery(filters = {}, allowedFilters = []) {
  const params = new URLSearchParams();
  const allowedParams = [...allowedFilters, 'page', 'size'];

  for (const key of allowedParams) {
    const value = filters[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value));
    }
  }

  const sort = filters.sort;
  if (Array.isArray(sort)) {
    sort.forEach(value => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append('sort', String(value));
      }
    });
  } else if (sort !== undefined && sort !== null && String(sort).trim() !== '') {
    params.set('sort', String(sort));
  }

  return params.toString();
}

function withQuery(path, query) {
  return query ? `${path}?${query}` : path;
}

function validateLogoFile(file) {
  if (!file || file.size === 0) {
    throw new Error('Sélectionnez un fichier image non vide.');
  }

  if (file.size > MAX_LOGO_SIZE) {
    throw new Error('Le logo ne doit pas dépasser 5 Mo.');
  }

  const fileType = (file.type || '').toLowerCase();
  const hasAllowedExtension = ALLOWED_LOGO_EXTENSIONS.test(file.name || '');
  if (fileType === 'image/svg+xml' || /\.svg$/i.test(file.name || '')
      || (fileType && !ALLOWED_LOGO_TYPES.includes(fileType))
      || (!fileType && !hasAllowedExtension)) {
    throw new Error('Le logo doit être une image PNG ou JPEG.');
  }
}

export const getMyCompanyProfile = options => apiRequest('/companies/me', options);

export const getPublicCompanyProfiles = options => apiRequest('/companies', options);

export const createCompanyProfile = data => apiRequest('/companies', {
  method: 'POST',
  body: data
});

export const updateMyCompanyProfile = data => apiRequest('/companies/me', {
  method: 'PUT',
  body: data
});

export const uploadCompanyLogo = file => {
  validateLogoFile(file);
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest('/companies/me/logo', {
    method: 'POST',
    body: formData
  });
};

export const deleteCompanyLogo = () => apiRequest('/companies/me/logo', {
  method: 'DELETE'
});

export const getPendingJobOffers = (filters = {}, options) => {
  const query = buildQuery(filters);
  return apiRequest(withQuery('/jobs/pending', query), options);
};

export const createJobOffer = data => apiRequest('/jobs', {
  method: 'POST',
  body: data
});

export const getMyJobOffers = (filters = {}, options) => {
  const query = buildQuery(filters, ['title', 'location', 'contractType', 'status']);
  return apiRequest(withQuery('/jobs/mine', query), options);
};

export const getMyJobOfferById = id => apiRequest(`/jobs/mine/${encodeURIComponent(id)}`);

export const updateMyJobOffer = (id, data) => apiRequest(
  `/jobs/mine/${encodeURIComponent(id)}`,
  { method: 'PUT', body: data }
);

export const submitMyJobOffer = id => apiRequest(
  `/jobs/mine/${encodeURIComponent(id)}/submit`,
  { method: 'PATCH' }
);

export const approveJobOffer = id => apiRequest(
  `/jobs/${encodeURIComponent(id)}/approve`,
  { method: 'PATCH' }
);

export const rejectJobOffer = id => apiRequest(
  `/jobs/${encodeURIComponent(id)}/reject`,
  { method: 'PATCH' }
);

export const closeMyJobOffer = id => apiRequest(
  `/jobs/mine/${encodeURIComponent(id)}/close`,
  { method: 'PATCH' }
);

export const deleteMyJobOffer = id => apiRequest(
  `/jobs/mine/${encodeURIComponent(id)}`,
  { method: 'DELETE' }
);

export const getPublishedJobOffers = (filters = {}, options) => {
  const query = buildQuery(filters, ['title', 'location', 'contractType']);
  return apiRequest(withQuery('/jobs', query), options);
};

export const getPublishedJobOfferById = id => apiRequest(`/jobs/${encodeURIComponent(id)}`);

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
      return { message: 'CV enregistré', cvUrl };
    }
  },

  // 2b. Company Profiles (/api/companies) — Person 2
  companies: {
    getMine: getMyCompanyProfile,
    getAll: getPublicCompanyProfiles,
    create: createCompanyProfile,
    updateMine: updateMyCompanyProfile,
    uploadLogo: uploadCompanyLogo,
    deleteLogo: deleteCompanyLogo
  },

  // 3. Job Offers (/api/jobs) — Person 2
  jobs: {
    getAll: getPublishedJobOffers,
    getById: getPublishedJobOfferById,
    create: createJobOffer,
    update: updateMyJobOffer,
    delete: deleteMyJobOffer,
    getMine: getMyJobOffers,
    getMineById: getMyJobOfferById,
    submitMine: submitMyJobOffer,
    approve: approveJobOffer,
    reject: rejectJobOffer,
    closeMine: closeMyJobOffer,
    getPending: getPendingJobOffers
  },

  // 4. Applications (/api/applications) — Person 3
  applications: {
    apply: async ({ candidateId, userId, jobOfferId, motivationMessage, cvUrl }) => {
      return request('/applications/apply', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: candidateId || userId,
          jobOfferId,
          motivationMessage,
          cvUrl
        })
      });
    },

    getCandidateApplications: async (candidateId) => {
      const apps = await request(`/applications/candidate/${candidateId}`).catch(() => []);
      if (!Array.isArray(apps)) return [];
      try {
        const jobsData = await api.jobs.getAll({ size: 100 });
        const jobs = Array.isArray(jobsData) ? jobsData : jobsData?.content || [];
        const jobMap = new Map(jobs.map(j => [j.id, j]));
        return apps.map(app => {
          const job = jobMap.get(app.jobOfferId);
          return {
            ...app,
            jobTitle: job?.title || `Offre #${app.jobOfferId}`,
            companyName: job?.companyName || 'Entreprise partenaire',
            location: job?.location || ''
          };
        });
      } catch {
        return apps;
      }
    },

    getJobApplications: async (jobOfferId) => {
      return request(`/applications/job/${jobOfferId}`);
    },

    getAll: async () => {
      const apps = await request('/applications').catch(() => []);
      if (!Array.isArray(apps)) return [];
      try {
        const jobsData = await api.jobs.getAll({ size: 100 });
        const jobs = Array.isArray(jobsData) ? jobsData : jobsData?.content || [];
        const jobMap = new Map(jobs.map(j => [j.id, j]));
        return apps.map(app => {
          const job = jobMap.get(app.jobOfferId);
          return {
            ...app,
            jobTitle: job?.title || `Offre #${app.jobOfferId}`,
            companyName: job?.companyName || 'Entreprise partenaire'
          };
        });
      } catch {
        return apps;
      }
    },

    updateStatus: async (applicationId, status) => {
      return request(`/applications/${applicationId}/status?status=${status}`, {
        method: 'PATCH'
      });
    },

    withdraw: async (applicationId) => {
      return request(`/applications/${applicationId}/withdraw`, {
        method: 'PUT'
      });
    },

    uploadCv: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const res = await fetch(`${BASE_URL}/applications/upload-cv`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      return data?.data?.cvUrl || data?.cvUrl;
    }
  },

  // 4b. Interviews (/api/interviews) — Person 3
  interviews: {
    schedule: async ({ applicationId, scheduledAt, location, meetingUrl, notes }) => {
      return request('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          applicationId,
          scheduledAt,
          location: location || 'Google Meet',
          meetingUrl: meetingUrl || 'https://meet.google.com/jobflow-interview',
          notes: notes || 'Entretien programmé'
        })
      });
    },
    getByApplication: async (applicationId) => {
      return request(`/interviews/application/${applicationId}`);
    },
    updateStatus: async (id, status) => {
      return request(`/interviews/${id}/status?status=${status}`, {
        method: 'PATCH'
      });
    }
  },

  // 5. Technical Assessment Tests (/api/tests) — Person 3
  tests: {
    getAll: async () => {
      return request('/tests');
    },

    getForJob: async (jobOfferId) => {
      return request(`/tests/job/${jobOfferId}`);
    },

    submit: async ({ testId, applicationId, score }) => {
      return request('/tests/submit', {
        method: 'POST',
        body: JSON.stringify({ testId, applicationId, score, status: 'COMPLETED' })
      });
    },

    getAttemptsForApplication: async (applicationId) => {
      return request(`/test-attempts/application/${applicationId}`);
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
