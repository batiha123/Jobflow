/**
 * JobFlow Database Store
 * Implements the MySQL schema from database/sql.sql
 * Stored locally in localStorage with relational integrity
 */

const STORAGE_KEY = 'jobflow_mysql_database_v1';

const initialDatabase = {
  users: [
    {
      id: 1,
      name: 'Yasmine Benali',
      email: 'yasmine.benali@example.com',
      password_hash: 'hashed_pwd_123',
      phone: '+33 6 12 34 56 78',
      role: 'CANDIDATE',
      account_status: 'ACTIVE',
      created_at: '2026-02-15 10:30:00'
    },
    {
      id: 2,
      name: 'Thomas Laurent',
      email: 'recrutement@novatech.io',
      password_hash: 'hashed_pwd_456',
      phone: '+33 1 42 68 90 00',
      role: 'COMPANY',
      account_status: 'ACTIVE',
      created_at: '2026-01-10 09:15:00'
    },
    {
      id: 3,
      name: 'Claire Moreau',
      email: 'contact@lumenlabs.fr',
      password_hash: 'hashed_pwd_789',
      phone: '+33 4 78 92 11 22',
      role: 'COMPANY',
      account_status: 'ACTIVE',
      created_at: '2026-01-20 14:00:00'
    },
    {
      id: 4,
      name: 'Administrateur JobFlow',
      email: 'admin@jobflow.com',
      password_hash: 'hashed_admin_999',
      phone: '+33 1 80 00 12 34',
      role: 'ADMIN',
      account_status: 'ACTIVE',
      created_at: '2026-01-01 08:00:00'
    }
  ],

  company_profiles: [
    {
      id: 1,
      user_id: 2,
      company_name: 'NovaTech Solutions',
      description: 'Leader européen en solutions cloud et ingénierie logicielle pour les entreprises en forte croissance.',
      address: '15 Avenue des Champs-Élysées, 75008 Paris',
      website: 'https://novatech.io',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
      created_at: '2026-01-10 09:20:00'
    },
    {
      id: 2,
      user_id: 3,
      company_name: 'Lumen Labs',
      description: 'Studio produit & design spécialisé dans les interfaces SaaS IA de nouvelle génération.',
      address: '22 Quai Victor Augagneur, 69003 Lyon',
      website: 'https://lumenlabs.fr',
      logo_url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=120&h=120&q=80',
      created_at: '2026-01-20 14:10:00'
    }
  ],

  candidate_profiles: [
    {
      id: 1,
      user_id: 1,
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&h=250&q=80',
      headline: 'Développeuse Fullstack React & Spring Boot · 3 ans d’expérience',
      about_me: 'Passionnée par la conception de produits web performants et intuitifs. Expérience concrète sur des architectures micro-services et React moderne.',
      skills: 'React, JavaScript, Spring Boot, Java, MySQL, REST API, Git, Docker, CSS Modules',
      education: 'Master Informatique & Systèmes d’Information — Université Paris-Saclay (2021-2023)',
      experience: '2 ans Développeuse Web chez AlphaDev (2023-2025) · Conception de dashboards analytiques.',
      created_at: '2026-02-15 10:45:00'
    }
  ],

  job_offers: [
    {
      id: 1,
      company_id: 1,
      title: 'Développeur Fullstack React / Spring Boot',
      description: 'Nous recherchons un développeur Fullstack talentueux pour concevoir et faire évoluer notre plateforme SaaS utilisée par plus de 50 000 utilisateurs quotidiens. Vous travaillerez en étroite collaboration avec l’équipe produit.',
      location: 'Paris (Hybride)',
      contract_type: 'FULL_TIME',
      salary_min: 45000,
      salary_max: 55000,
      status: 'PUBLISHED',
      publication_date: '2026-03-01 10:00:00',
      created_at: '2026-03-01 09:30:00'
    },
    {
      id: 2,
      company_id: 2,
      title: 'Product Designer Senior (UI/UX)',
      description: 'Rejoignez Lumen Labs pour imaginer l’avenir des applications pilotées par l’IA. Vous dirigerez la recherche utilisateur, concevrez les wireframes et les composants graphiques haut de gamme.',
      location: 'Lyon (Télétravail possible)',
      contract_type: 'FULL_TIME',
      salary_min: 48000,
      salary_max: 60000,
      status: 'PUBLISHED',
      publication_date: '2026-03-05 14:30:00',
      created_at: '2026-03-05 14:00:00'
    },
    {
      id: 3,
      company_id: 1,
      title: 'Data Analyst & Ingénieur SQL',
      description: 'Au sein de l’équipe Data, vous optimiserez nos flux MySQL, bâtirez des dashboards de pilotage et participerez à la modélisation de nos algorithmes de recommandation.',
      location: 'Paris (Sur site)',
      contract_type: 'FULL_TIME',
      salary_min: 42000,
      salary_max: 50000,
      status: 'PUBLISHED',
      publication_date: '2026-03-08 09:00:00',
      created_at: '2026-03-08 08:30:00'
    },
    {
      id: 4,
      company_id: 2,
      title: 'Stagiaire Développeur Frontend React',
      description: 'Stage de fin d’études de 6 mois avec opportunité d’embauche en CDI. Participation au développement des interfaces interactives de nos applications clientes.',
      location: 'Lyon / À distance',
      contract_type: 'INTERNSHIP',
      salary_min: 15000,
      salary_max: 18000,
      status: 'PUBLISHED',
      publication_date: '2026-03-10 11:00:00',
      created_at: '2026-03-10 10:30:00'
    }
  ],

  applications: [
    {
      id: 1,
      candidate_id: 1,
      job_offer_id: 1,
      cv_url: 'https://jobflow.com/resumes/yasmine-benali-cv.pdf',
      motivation_message: 'Madame, Monsieur, très motivée par les défis techniques de NovaTech, je souhaite mettre à profit mes compétences en React et Spring Boot.',
      application_date: '2026-03-12 11:20:00',
      status: 'SHORTLISTED'
    },
    {
      id: 2,
      candidate_id: 1,
      job_offer_id: 2,
      cv_url: 'https://jobflow.com/resumes/yasmine-benali-cv.pdf',
      motivation_message: 'Mon profil hybride design & code me permet de dialoguer efficacement avec les designers et ingénieurs.',
      application_date: '2026-03-14 16:45:00',
      status: 'UNDER_REVIEW'
    }
  ],

  tests: [
    {
      id: 1,
      job_offer_id: 1,
      title: 'Évaluation Technique React & API REST',
      description: 'QCM et mise en situation sur les hooks React, la gestion d’état et la consommation d’APIs REST sécurisées.',
      duration_minutes: 45,
      passing_score: 75.0,
      created_at: '2026-03-01 10:15:00'
    }
  ],

  test_attempts: [
    {
      id: 1,
      test_id: 1,
      application_id: 1,
      started_at: '2026-03-13 14:00:00',
      completed_at: '2026-03-13 14:38:00',
      score: 92.0,
      status: 'COMPLETED'
    }
  ],

  interviews: [
    {
      id: 1,
      application_id: 1,
      scheduled_at: '2026-03-20 10:00:00',
      location: 'Google Meet',
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      notes: 'Entretien technique d’une heure avec Thomas Laurent (Lead Dev) et RH.',
      status: 'SCHEDULED',
      created_at: '2026-03-15 09:00:00'
    }
  ],

  notifications: [
    {
      id: 1,
      user_id: 1,
      message: 'Votre candidature chez NovaTech Solutions a été retenue pour un entretien !',
      is_read: false,
      created_at: '2026-03-15 09:05:00'
    },
    {
      id: 2,
      user_id: 2,
      message: 'Nouvelle candidature reçue de Yasmine Benali pour le poste Développeur Fullstack.',
      is_read: true,
      created_at: '2026-03-12 11:21:00'
    }
  ],

  job_offer_reports: [
    {
      id: 1,
      user_id: 1,
      job_offer_id: 3,
      reason: 'Information de salaire incomplète',
      description: 'Le salaire indiqué sur l’annonce ne précisait pas les primes variables.',
      report_date: '2026-03-11 15:30:00',
      status: 'REVIEWED'
    }
  ],

  admin_profiles: [
    {
      id: 1,
      user_id: 4,
      position: 'Superviseur de Plateforme',
      department: 'Direction des Opérations & Confiance',
      bio: 'Responsable de la conformité des offres et de l’expérience globale des recruteurs et candidats.',
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: '2026-01-01 08:30:00'
    }
  ]
};

// LocalStorage helpers
function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDatabase));
      return initialDatabase;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse database from localStorage', err);
    return initialDatabase;
  }
}

function saveDatabase(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save database to localStorage', err);
  }
}

export const db = {
  // Read All
  getAll: () => loadDatabase(),

  // Reset
  reset: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDatabase));
    return initialDatabase;
  },

  // Users & Profiles
  getUsers: () => loadDatabase().users || [],
  
  getCompanyProfiles: () => {
    const data = loadDatabase();
    return (data.company_profiles || []).map(comp => {
      const user = (data.users || []).find(u => u.id === comp.user_id) || {};
      const activeOffers = (data.job_offers || []).filter(o => o.company_id === comp.id && o.status === 'PUBLISHED').length;
      return {
        ...comp,
        contact_name: user.name || '',
        contact_email: user.email || '',
        contact_phone: user.phone || '',
        active_offers_count: activeOffers
      };
    });
  },

  getCompanyProfileById: (id) => {
    const companies = db.getCompanyProfiles();
    return companies.find(c => c.id === Number(id)) || null;
  },

  getCompanyProfileByUser: (user) => {
    if (!user) return null;
    const data = loadDatabase();
    const companies = data.company_profiles || [];
    
    // Check demo NovaTech company
    if (user.email === 'sophie.mercier@novatech.io' || user.email === 'recrutement@novatech.io') {
      const nova = companies.find(c => c.id === 1) || {};
      return {
        ...nova,
        company_name: nova.company_name || 'NovaTech Solutions',
        contact_name: user.name || 'Sophie Mercier',
        contact_email: user.email,
        contact_phone: '+33 1 42 68 90 00'
      };
    }

    // Look for company profile linked by email or user_id
    const found = companies.find(c => c.user_email === user.email || (user.id && c.user_id === user.id));
    if (found) {
      return {
        ...found,
        company_name: found.company_name || user.companyName || user.name || '',
        contact_name: found.contact_name || user.name || '',
        contact_email: user.email,
        contact_phone: found.contact_phone || user.phone || ''
      };
    }

    // Default empty profile for newly registered company
    return {
      id: null,
      user_id: user.id || null,
      user_email: user.email,
      company_name: user.companyName || user.name || '',
      description: '',
      address: '',
      website: '',
      logo_url: '',
      contact_name: user.name || '',
      contact_email: user.email || '',
      contact_phone: user.phone || '',
      active_offers_count: 0
    };
  },

  updateCompanyProfileByUser: (user, updatedFields) => {
    if (!user) return null;
    const data = loadDatabase();
    data.company_profiles = data.company_profiles || [];

    let index = -1;
    if (user.email === 'recrutement@novatech.io') {
      index = data.company_profiles.findIndex(c => c.id === 1);
    } else {
      index = data.company_profiles.findIndex(c => c.user_email === user.email || (user.id && c.user_id === user.id));
    }

    const now = new Date().toISOString();
    if (index === -1) {
      const newId = data.company_profiles.length > 0 ? Math.max(...data.company_profiles.map(c => c.id)) + 1 : 10;
      const newComp = {
        id: newId,
        user_id: user.id || null,
        user_email: user.email,
        company_name: updatedFields.company_name || user.companyName || user.name || '',
        description: updatedFields.description || '',
        address: updatedFields.address || '',
        website: updatedFields.website || '',
        logo_url: updatedFields.logo_url || '',
        contact_name: updatedFields.contact_name || user.name || '',
        contact_email: user.email,
        contact_phone: updatedFields.contact_phone || user.phone || '',
        created_at: now,
        updated_at: now
      };
      data.company_profiles.push(newComp);
      saveDatabase(data);
      return newComp;
    } else {
      const current = data.company_profiles[index];
      data.company_profiles[index] = {
        ...current,
        company_name: updatedFields.company_name ?? current.company_name,
        description: updatedFields.description ?? current.description,
        address: updatedFields.address ?? current.address,
        website: updatedFields.website ?? current.website,
        logo_url: updatedFields.logo_url ?? current.logo_url,
        contact_name: updatedFields.contact_name ?? current.contact_name,
        contact_email: user.email,
        contact_phone: updatedFields.contact_phone ?? current.contact_phone,
        updated_at: now
      };
      saveDatabase(data);
      return data.company_profiles[index];
    }
  },

  updateCompanyProfile: (companyId, updatedFields) => {
    const data = loadDatabase();
    const index = (data.company_profiles || []).findIndex(c => c.id === Number(companyId));
    if (index === -1) return null;

    const current = data.company_profiles[index];
    data.company_profiles[index] = {
      ...current,
      company_name: updatedFields.company_name ?? current.company_name,
      description: updatedFields.description ?? current.description,
      address: updatedFields.address ?? current.address,
      website: updatedFields.website ?? current.website,
      logo_url: updatedFields.logo_url ?? current.logo_url,
      updated_at: new Date().toISOString()
    };

    // Update associated user if email/phone/name provided
    const userIndex = (data.users || []).findIndex(u => u.id === current.user_id);
    if (userIndex !== -1) {
      if (updatedFields.contact_name) data.users[userIndex].name = updatedFields.contact_name;
      if (updatedFields.contact_email) data.users[userIndex].email = updatedFields.contact_email;
      if (updatedFields.contact_phone) data.users[userIndex].phone = updatedFields.contact_phone;
    }

    saveDatabase(data);
    return data.company_profiles[index];
  },

  getCandidateProfiles: () => {
    const data = loadDatabase();
    return (data.candidate_profiles || []).map(cand => {
      const user = (data.users || []).find(u => u.id === cand.user_id) || {};
      return {
        ...cand,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      };
    });
  },

  getCandidateProfileById: (id) => {
    const candidates = db.getCandidateProfiles();
    return candidates.find(c => c.id === Number(id)) || null;
  },

  getCandidateProfileByUser: (user) => {
    if (!user) return null;
    const data = loadDatabase();
    const candidates = data.candidate_profiles || [];

    // Check demo Yasmine profile
    if (user.email === 'yasmine.benali@gmail.com' || user.email === 'yasmine.benali@example.com') {
      const yasmine = candidates.find(c => c.user_id === 1) || {};
      return {
        ...yasmine,
        name: user.name || 'Yasmine Benali',
        email: user.email,
        phone: yasmine.phone || '+33 6 12 34 56 78'
      };
    }

    // Look for candidate profile linked to this user's email or id
    const found = candidates.find(c => c.user_email === user.email || (user.id && c.user_id === user.id));
    if (found) {
      return {
        ...found,
        name: found.name || user.name || '',
        email: user.email,
        phone: found.phone || user.phone || ''
      };
    }

    // Default clean empty profile for newly registered candidate
    return {
      id: null,
      user_id: user.id || null,
      user_email: user.email,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      photo_url: '',
      headline: '',
      about_me: '',
      skills: '',
      education: '',
      experience: ''
    };
  },

  updateCandidateProfileByUser: (user, updatedFields) => {
    if (!user) return null;
    const data = loadDatabase();
    data.candidate_profiles = data.candidate_profiles || [];

    let index = -1;
    if (user.email === 'yasmine.benali@example.com') {
      index = data.candidate_profiles.findIndex(c => c.user_id === 1);
    } else {
      index = data.candidate_profiles.findIndex(c => c.user_email === user.email || (user.id && c.user_id === user.id));
    }

    const now = new Date().toISOString();
    if (index === -1) {
      const newId = data.candidate_profiles.length > 0 ? Math.max(...data.candidate_profiles.map(c => c.id)) + 1 : 10;
      const newProfile = {
        id: newId,
        user_id: user.id || null,
        user_email: user.email,
        name: updatedFields.name || user.name || '',
        email: user.email,
        phone: updatedFields.phone || user.phone || '',
        headline: updatedFields.headline || '',
        about_me: updatedFields.about_me || '',
        skills: updatedFields.skills || '',
        education: updatedFields.education || '',
        experience: updatedFields.experience || '',
        photo_url: updatedFields.photo_url || '',
        created_at: now,
        updated_at: now
      };
      data.candidate_profiles.push(newProfile);
      saveDatabase(data);
      return newProfile;
    } else {
      const current = data.candidate_profiles[index];
      data.candidate_profiles[index] = {
        ...current,
        name: updatedFields.name ?? current.name,
        email: user.email,
        phone: updatedFields.phone ?? current.phone,
        headline: updatedFields.headline ?? current.headline,
        about_me: updatedFields.about_me ?? current.about_me,
        skills: updatedFields.skills ?? current.skills,
        education: updatedFields.education ?? current.education,
        experience: updatedFields.experience ?? current.experience,
        photo_url: updatedFields.photo_url ?? current.photo_url,
        updated_at: now
      };
      saveDatabase(data);
      return data.candidate_profiles[index];
    }
  },

  updateCandidateProfile: (candidateId, updatedFields) => {
    const data = loadDatabase();
    const index = (data.candidate_profiles || []).findIndex(c => c.id === Number(candidateId));
    if (index === -1) return null;

    const current = data.candidate_profiles[index];
    data.candidate_profiles[index] = {
      ...current,
      headline: updatedFields.headline ?? current.headline,
      about_me: updatedFields.about_me ?? current.about_me,
      skills: updatedFields.skills ?? current.skills,
      education: updatedFields.education ?? current.education,
      experience: updatedFields.experience ?? current.experience,
      photo_url: updatedFields.photo_url ?? current.photo_url,
      updated_at: new Date().toISOString()
    };

    // Update user contact details
    const userIndex = (data.users || []).findIndex(u => u.id === current.user_id);
    if (userIndex !== -1) {
      if (updatedFields.name) data.users[userIndex].name = updatedFields.name;
      if (updatedFields.email) data.users[userIndex].email = updatedFields.email;
      if (updatedFields.phone) data.users[userIndex].phone = updatedFields.phone;
    }

    saveDatabase(data);
    return data.candidate_profiles[index];
  },

  // Job Offers
  getJobOffers: () => {
    const data = loadDatabase();
    const companies = data.company_profiles || [];
    return (data.job_offers || []).map(offer => {
      const company = companies.find(c => c.id === offer.company_id) || { company_name: 'Entreprise Partenaire', logo_url: '' };
      return {
        ...offer,
        company_name: company.company_name,
        company_logo: company.logo_url
      };
    });
  },

  createJobOffer: (offer) => {
    const data = loadDatabase();
    const newId = (data.job_offers || []).length > 0 ? Math.max(...data.job_offers.map(o => o.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newOffer = {
      id: newId,
      company_id: Number(offer.company_id) || 1,
      title: offer.title || 'Nouveau Poste',
      description: offer.description || '',
      location: offer.location || 'Paris (France)',
      contract_type: offer.contract_type || 'FULL_TIME',
      salary_min: Number(offer.salary_min) || 0,
      salary_max: Number(offer.salary_max) || 0,
      status: offer.status || 'PUBLISHED',
      publication_date: now,
      created_at: now
    };
    data.job_offers = [newOffer, ...(data.job_offers || [])];
    saveDatabase(data);
    return newOffer;
  },

  updateJobOffer: (id, fields) => {
    const data = loadDatabase();
    const index = (data.job_offers || []).findIndex(o => o.id === Number(id));
    if (index === -1) return null;
    data.job_offers[index] = { ...data.job_offers[index], ...fields, updated_at: new Date().toISOString() };
    saveDatabase(data);
    return data.job_offers[index];
  },

  deleteJobOffer: (id) => {
    const data = loadDatabase();
    data.job_offers = (data.job_offers || []).filter(o => o.id !== Number(id));
    saveDatabase(data);
    return true;
  },

  getJobOffersForCompany: (user) => {
    if (!user) return [];
    const allOffers = db.getJobOffers();
    if (user.email === 'sophie.mercier@novatech.io' || user.email === 'recrutement@novatech.io') {
      return allOffers.filter(o => o.company_id === 1);
    }
    return allOffers.filter(o => 
      o.company_email === user.email || 
      (user.id && (o.company_id === user.id || o.company_id === Number(user.id)))
    );
  },

  createJobOfferForCompany: (user, offer) => {
    const data = loadDatabase();
    const newId = (data.job_offers || []).length > 0 ? Math.max(...data.job_offers.map(o => o.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newOffer = {
      id: newId,
      company_id: user?.id || 1,
      company_email: user?.email || '',
      company_name: user?.companyName || user?.name || offer.company_name || 'Mon Entreprise',
      title: offer.title || 'Nouveau Poste',
      description: offer.description || '',
      location: offer.location || 'Paris (France)',
      contract_type: offer.contract_type || 'FULL_TIME',
      salary_min: Number(offer.salary_min) || 0,
      salary_max: Number(offer.salary_max) || 0,
      status: offer.status || 'PUBLISHED',
      publication_date: now,
      created_at: now
    };
    data.job_offers = [newOffer, ...(data.job_offers || [])];
    saveDatabase(data);
    return newOffer;
  },

  // Applications
  getApplications: () => {
    const data = loadDatabase();
    const offers = data.job_offers || [];
    const candidates = db.getCandidateProfiles();
    const companies = data.company_profiles || [];

    return (data.applications || []).map(app => {
      const offer = offers.find(o => o.id === app.job_offer_id) || {};
      const company = companies.find(c => c.id === offer.company_id) || {};
      const candidate = candidates.find(c => c.id === app.candidate_id) || {};
      const interview = (data.interviews || []).find(i => i.application_id === app.id);
      const testAttempt = (data.test_attempts || []).find(t => t.application_id === app.id);

      return {
        ...app,
        offer_title: offer.title || app.offer_title || 'Offre inconnue',
        company_name: company.company_name || offer.company_name || app.company_name || 'Entreprise',
        candidate_name: app.candidate_name || candidate.name || 'Candidat',
        candidate_headline: app.candidate_headline || candidate.headline || '',
        candidate_skills: app.candidate_skills || candidate.skills || '',
        interview,
        testAttempt
      };
    });
  },

  getApplicationsForCandidate: (user) => {
    if (!user) return [];
    const all = db.getApplications();
    if (user.email === 'yasmine.benali@gmail.com' || user.email === 'yasmine.benali@example.com') {
      return all.filter(a => a.candidate_id === 1);
    }
    return all.filter(a => 
      a.candidate_email === user.email || 
      (user.id && (a.candidate_id === user.id || a.candidate_id === Number(user.id)))
    );
  },

  getApplicationsForCompany: (user) => {
    if (!user) return [];
    const all = db.getApplications();
    if (user.email === 'sophie.mercier@novatech.io' || user.email === 'recrutement@novatech.io') {
      return all.filter(a => a.company_id === 1 || a.job_offer_id === 1);
    }
    const myOffers = db.getJobOffersForCompany(user);
    const myOfferIds = myOffers.map(o => o.id);
    return all.filter(a => 
      myOfferIds.includes(a.job_offer_id) || 
      a.company_email === user.email
    );
  },

  submitApplication: ({ candidate_id = 1, candidate_email = '', candidate_name = '', candidate = null, job_offer_id, motivation_message, cv_url }) => {
    const data = loadDatabase();
    const newId = (data.applications || []).length > 0 ? Math.max(...data.applications.map(a => a.id)) + 1 : 1;
    
    const offer = (data.job_offers || []).find(o => o.id === Number(job_offer_id));
    const candEmail = candidate?.email || candidate_email || '';
    const candName = candidate?.name || candidate_name || 'Candidat';
    const candId = candidate?.id || candidate_id || 1;

    const newApp = {
      id: newId,
      candidate_id: Number(candId),
      candidate_email: candEmail,
      candidate_name: candName,
      job_offer_id: Number(job_offer_id),
      offer_title: offer?.title || 'Offre d\'emploi',
      company_name: offer?.company_name || 'Entreprise',
      company_email: offer?.company_email || '',
      cv_url: cv_url || 'https://jobflow.com/resumes/mon-cv.pdf',
      motivation_message: motivation_message || '',
      application_date: new Date().toISOString(),
      status: 'SUBMITTED'
    };
    data.applications = [newApp, ...(data.applications || [])];
    saveDatabase(data);
    return newApp;
  },

  updateApplicationStatus: (id, status) => {
    const data = loadDatabase();
    const index = (data.applications || []).findIndex(a => a.id === Number(id));
    if (index === -1) return null;
    data.applications[index].status = status;
    saveDatabase(data);
    return data.applications[index];
  },

  // Interviews
  getInterviews: () => {
    const data = loadDatabase();
    return data.interviews || [];
  },

  scheduleInterview: ({ application_id, scheduled_at, location, meeting_url, notes }) => {
    const data = loadDatabase();
    const newId = (data.interviews || []).length > 0 ? Math.max(...data.interviews.map(i => i.id)) + 1 : 1;
    const newInterview = {
      id: newId,
      application_id: Number(application_id),
      scheduled_at: scheduled_at || new Date().toISOString(),
      location: location || 'Google Meet',
      meeting_url: meeting_url || 'https://meet.google.com/new',
      notes: notes || '',
      status: 'SCHEDULED',
      created_at: new Date().toISOString()
    };
    data.interviews = [newInterview, ...(data.interviews || [])];
    saveDatabase(data);
    return newInterview;
  }
};
