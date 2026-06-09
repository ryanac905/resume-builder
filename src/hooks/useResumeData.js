import { useState, useEffect, useCallback, useRef } from 'react';

export const DEFAULT_DATA = {
  personalInfo: {
    firstName: 'Alex',
    lastName: 'Johnson',
    title: 'Senior Software Engineer',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    website: 'alexjohnson.dev',
  },
  summary:
    'Passionate software engineer with 6+ years of experience building scalable web applications and distributed systems. Proven track record of leading cross-functional teams, shipping high-impact features, and mentoring junior engineers. Strong background in React, Node.js, and cloud infrastructure.',
  experience: [
    {
      id: '1',
      company: 'Nexus Technologies',
      role: 'Senior Software Engineer',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description:
        'Led the core platform team responsible for the product dashboard and real-time infrastructure serving millions of users.',
      bullets: [
        'Led a team of 5 engineers to redesign the core product dashboard, reducing load time by 60% and increasing user engagement by 35%.',
        'Architected and built a real-time notification system serving 2M+ users using WebSockets and Redis pub/sub.',
        'Implemented CI/CD pipelines with GitHub Actions, cutting deployment time from 45 minutes to under 8 minutes.',
      ],
    },
    {
      id: '2',
      company: 'Luminary Labs',
      role: 'Software Engineer',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      description:
        'Built and maintained backend services and APIs for a high-traffic SaaS product used by enterprise clients.',
      bullets: [
        'Built and maintained RESTful APIs consumed by 15+ internal teams using Node.js and PostgreSQL.',
        'Migrated monolithic application to microservices, improving scalability and reducing infrastructure costs by 40%.',
        'Collaborated with design and product teams to ship 3 major feature releases per quarter.',
      ],
    },
  ],
  education: [
    {
      id: '1',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2014',
      endDate: '2018',
      gpa: '3.8',
    },
  ],
  skills:
    'React, TypeScript, Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, REST APIs, Git',
  projects: [
    {
      id: '1',
      name: 'OpenFlow',
      description:
        'An open-source workflow automation tool built with React and Node.js. Supports drag-and-drop pipeline creation with 20+ built-in integrations.',
      link: 'github.com/alexj/openflow',
    },
    {
      id: '2',
      name: 'DevPulse',
      description:
        'Developer productivity dashboard that aggregates metrics from GitHub, Jira, and Slack to surface actionable insights for engineering teams.',
      link: 'devpulse.io',
    },
  ],
};

const BLANK_DATA = {
  personalInfo: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: '',
  projects: [],
};

const CVS_STORAGE_KEY = 'resume-builder-cvs';
const LAST_ACTIVE_KEY = 'resume-builder-last-active';

function generateId() {
  return 'cv_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9));
}

function generateItemId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
}

// ── Storage helpers ──────────────────────────────────────────────────────────

export function loadAllCVs() {
  try {
    const raw = localStorage.getItem(CVS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate it's a plain object
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveAllCVs(cvs) {
  try {
    localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(cvs));
  } catch {
    // ignore
  }
}

export function getLastActiveId() {
  try {
    return localStorage.getItem(LAST_ACTIVE_KEY) || null;
  } catch {
    return null;
  }
}

export function setLastActiveId(id) {
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, id);
  } catch {
    // ignore
  }
}

// ── Multi-CV CRUD helpers ────────────────────────────────────────────────────

export function initializeCVs() {
  let cvs = loadAllCVs();
  if (!cvs || Object.keys(cvs).length === 0) {
    // Check for legacy single-CV storage
    try {
      const legacy = localStorage.getItem('resume-builder-data');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const legacyData = parsed.resumeData || DEFAULT_DATA;
        const legacyTemplate = parsed.template || 'modern';
        const id = generateId();
        cvs = {
          [id]: {
            id,
            name: 'My First CV',
            template: legacyTemplate,
            lastEdited: new Date().toISOString(),
            data: legacyData,
          },
        };
        localStorage.removeItem('resume-builder-data');
        saveAllCVs(cvs);
        setLastActiveId(id);
        return cvs;
      }
    } catch {
      // ignore
    }

    // No legacy data — create default
    const id = generateId();
    cvs = {
      [id]: {
        id,
        name: 'My First CV',
        template: 'modern',
        lastEdited: new Date().toISOString(),
        data: DEFAULT_DATA,
      },
    };
    saveAllCVs(cvs);
    setLastActiveId(id);
  }
  return cvs;
}

export function createCV(name = 'Untitled CV', data = BLANK_DATA, template = 'modern') {
  const cvs = loadAllCVs() || {};
  const id = generateId();
  const cv = { id, name, template, lastEdited: new Date().toISOString(), data };
  cvs[id] = cv;
  saveAllCVs(cvs);
  setLastActiveId(id);
  return cv;
}

export function duplicateCV(id) {
  const cvs = loadAllCVs() || {};
  const source = cvs[id];
  if (!source) return null;
  const newId = generateId();
  const copy = {
    ...source,
    id: newId,
    name: source.name + ' (copy)',
    lastEdited: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(source.data)),
  };
  cvs[newId] = copy;
  saveAllCVs(cvs);
  return copy;
}

export function renameCV(id, name) {
  const cvs = loadAllCVs() || {};
  if (!cvs[id]) return;
  cvs[id].name = name;
  cvs[id].lastEdited = new Date().toISOString();
  saveAllCVs(cvs);
}

export function deleteCV(id) {
  const cvs = loadAllCVs() || {};
  delete cvs[id];
  saveAllCVs(cvs);
  if (getLastActiveId() === id) {
    const remaining = Object.keys(cvs);
    setLastActiveId(remaining.length > 0 ? remaining[0] : null);
  }
}

// ── Per-CV editor hook ───────────────────────────────────────────────────────

export function useResumeData(cvId) {
  const [cv, setCV] = useState(() => {
    const cvs = loadAllCVs() || {};
    return cvs[cvId] || null;
  });

  const [data, setData] = useState(() => cv?.data || DEFAULT_DATA);
  const [template, setTemplateState] = useState(() => cv?.template || 'modern');

  const debounceTimer = useRef(null);

  const persistToStorage = useCallback(
    (newData, newTemplate) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const cvs = loadAllCVs() || {};
        if (!cvs[cvId]) return;
        cvs[cvId].data = newData;
        cvs[cvId].template = newTemplate;
        cvs[cvId].lastEdited = new Date().toISOString();
        saveAllCVs(cvs);
      }, 500);
    },
    [cvId]
  );

  useEffect(() => {
    persistToStorage(data, template);
  }, [data, template, persistToStorage]);

  const setTemplate = useCallback(
    (t) => {
      setTemplateState(t);
    },
    []
  );

  // Personal info
  const updatePersonalInfo = useCallback((field, value) => {
    setData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  }, []);

  // Summary
  const updateSummary = useCallback((value) => {
    setData((prev) => ({ ...prev, summary: value }));
  }, []);

  // Experience
  const addExperience = useCallback(() => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: generateItemId(),
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          description: '',
          bullets: [''],
        },
      ],
    }));
  }, []);

  const updateExperience = useCallback((id, field, value) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const removeExperience = useCallback((id) => {
    setData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }, []);

  const addBullet = useCallback((expId) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
      ),
    }));
  }, []);

  const updateBullet = useCallback((expId, index, value) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => {
        if (e.id !== expId) return e;
        const bullets = [...e.bullets];
        bullets[index] = value;
        return { ...e, bullets };
      }),
    }));
  }, []);

  const removeBullet = useCallback((expId, index) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => {
        if (e.id !== expId) return e;
        const bullets = e.bullets.filter((_, i) => i !== index);
        return { ...e, bullets: bullets.length ? bullets : [''] };
      }),
    }));
  }, []);

  // Education
  const addEducation = useCallback(() => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: generateItemId(),
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
        },
      ],
    }));
  }, []);

  const updateEducation = useCallback((id, field, value) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const removeEducation = useCallback((id) => {
    setData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }, []);

  // Skills
  const updateSkills = useCallback((value) => {
    setData((prev) => ({ ...prev, skills: value }));
  }, []);

  // Projects
  const addProject = useCallback(() => {
    setData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { id: generateItemId(), name: '', description: '', link: '' },
      ],
    }));
  }, []);

  const updateProject = useCallback((id, field, value) => {
    setData((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  }, []);

  const removeProject = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== id),
    }));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all resume data?')) {
      setData(DEFAULT_DATA);
      setTemplateState('modern');
    }
  }, []);

  return {
    data,
    template,
    setTemplate,
    updatePersonalInfo,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addBullet,
    updateBullet,
    removeBullet,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
    addProject,
    updateProject,
    removeProject,
    clearAll,
  };
}
