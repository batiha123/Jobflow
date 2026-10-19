const seed = {
  jobs: [
    { id: 1, title: 'Frontend React Developer', company: 'Nova Studio', location: 'Paris, France', type: 'CDI', level: 'Junior', salary: '38–45k €', tags: ['React', 'TypeScript', 'Figma'], posted: 'Il y a 2 jours', logo: 'NS', color: '#e4efff', status: 'active', applications: 12 },
    { id: 2, title: 'Product Designer', company: 'Lumen Labs', location: 'Lyon, France', type: 'CDI', level: 'Confirmé', salary: '42–50k €', tags: ['Figma', 'UX Research', 'SaaS'], posted: 'Il y a 4 jours', logo: 'LL', color: '#fff1da', status: 'active', applications: 8 },
    { id: 3, title: 'Data Analyst', company: 'Greenly', location: 'Paris · Hybride', type: 'CDI', level: 'Junior', salary: '35–42k €', tags: ['SQL', 'Python', 'Tableau'], posted: 'Il y a 1 semaine', logo: 'G', color: '#e4f7eb', status: 'active', applications: 16 },
    { id: 4, title: 'Marketing Manager', company: 'Mistral Conseil', location: 'Bordeaux, France', type: 'CDD', level: 'Senior', salary: '45–55k €', tags: ['Growth', 'Content', 'B2B'], posted: 'Il y a 1 semaine', logo: 'MC', color: '#f2e9ff', status: 'draft', applications: 0 },
  ],
  applications: [
    { id: 1, job: 'Frontend React Developer', company: 'Nova Studio', date: '12 juin 2025', status: 'En entretien' },
    { id: 2, job: 'Product Designer', company: 'Lumen Labs', date: '08 juin 2025', status: 'Candidature envoyée' },
    { id: 3, job: 'Data Analyst', company: 'Greenly', date: '02 juin 2025', status: 'Refusée' },
  ],
  profile: { firstName: 'Marie', lastName: 'Dubois', email: 'marie.dubois@example.com', headline: 'Frontend Developer · React & TypeScript', summary: 'Développeuse frontend curieuse et passionnée par les produits utiles.', skills: 'React, TypeScript, Figma', languages: 'Français, Anglais' },
  candidates: [
    { id: 1, name: 'Marie Dubois', jobId: 1, date: '12 juin 2025', status: 'En entretien', match: '86%', skills: 'React, TypeScript' },
    { id: 2, name: 'Thomas Bernard', jobId: 1, date: '10 juin 2025', status: 'À examiner', match: '78%', skills: 'React, JavaScript' },
  ],
}

const clone = value => JSON.parse(JSON.stringify(value))
const storageKey = 'jobflow-local-development-data'

export function getLocalData() {
  try {
    const saved = window.localStorage.getItem(storageKey)
    return saved ? { ...clone(seed), ...JSON.parse(saved) } : clone(seed)
  } catch {
    return clone(seed)
  }
}

export function saveLocalData(data) {
  try { window.localStorage.setItem(storageKey, JSON.stringify(data)) } catch { /* local demo remains in memory */ }
  return data
}

export function resetLocalData() {
  try { window.localStorage.removeItem(storageKey) } catch { /* no persistent data to clear */ }
  return clone(seed)
}

export const mockDataNotice = 'Données locales de démonstration : aucune action n’est envoyée à un serveur.'
