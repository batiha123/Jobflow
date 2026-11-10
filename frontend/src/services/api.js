const DEFAULT_API_URL = 'http://localhost:8080/api';
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_LOGO_EXTENSIONS = /\.(png|jpe?g)$/i;

export const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

export function resolveApiAssetUrl(path) {
  if (!path) return '';
  const apiUrl = new URL(BASE_URL, window.location.origin);
  return new URL(path, apiUrl.origin).toString();
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');

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
    response = await fetch(`${BASE_URL}/${path.replace(/^\/+/, '')}`, {
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
