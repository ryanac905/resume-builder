import { useState, useEffect, useCallback, useRef } from 'react';

// ── Theme defaults ────────────────────────────────────────────────────────────
export const DEFAULT_THEME = {
  accent: '#1a3a5c',
  font: 'sans',       // 'sans' | 'serif' | 'mono'
  spacing: 1.5,       // line-height multiplier
  fontScale: 1,       // overall size multiplier
};

export const FONT_STACKS = {
  sans: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

// ── Sample data ────────────────────────────────────────────────────────────────
export const DEFAULT_DATA = {
  personalInfo: {
    firstName: 'Alex',
    lastName: 'Johnson',
    title: 'Senior Software Engineer',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    photo: '',
  },
  summary:
    'Passionate software engineer with 6+ years of experience building scalable web applications and distributed systems. Proven track record of leading cross-functional teams, shipping high-impact features, and mentoring junior engineers.',
  links: [
    { id: 'l1', label: 'LinkedIn', url: 'linkedin.com/in/alexjohnson' },
    { id: 'l2', label: 'Portfolio', url: 'alexjohnson.dev' },
  ],
  experience: [
    {
      id: '1',
      company: 'Nexus Technologies',
      role: 'Senior Software Engineer',
      startDate: 'Jan 2021',
      endDate: 'Present',
      content:
        '<p>Led the core platform team responsible for the product dashboard and real-time infrastructure.</p><ul><li>Led a team of 5 engineers to redesign the core product dashboard, reducing load time by 60%.</li><li>Architected a real-time notification system serving 2M+ users using WebSockets and Redis.</li><li>Implemented CI/CD pipelines with GitHub Actions, cutting deployment time to under 8 minutes.</li></ul>',
    },
    {
      id: '2',
      company: 'Luminary Labs',
      role: 'Software Engineer',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      content:
        '<p>Built and maintained backend services for a high-traffic SaaS product.</p><ul><li>Maintained RESTful APIs consumed by 15+ internal teams using Node.js and PostgreSQL.</li><li>Migrated a monolith to microservices, reducing infrastructure costs by 40%.</li></ul>',
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
  skills: [
    { id: 's1', name: 'React', level: 5 },
    { id: 's2', name: 'TypeScript', level: 5 },
    { id: 's3', name: 'Node.js', level: 4 },
    { id: 's4', name: 'Python', level: 4 },
    { id: 's5', name: 'PostgreSQL', level: 4 },
    { id: 's6', name: 'AWS', level: 3 },
  ],
  languages: [
    { id: 'lang1', name: 'English', level: 5 },
    { id: 'lang2', name: 'Spanish', level: 3 },
  ],
  certifications: [],
  courses: [],
  qualifications: [
    { id: 'q1', title: 'Member, The Hong Kong Institution of Engineers (MHKIE)', body: 'HKIE', year: '2022' },
  ],
  publicExams: [
    {
      id: 'pe1', exam: 'HKDSE', year: '2014',
      results: [
        { id: 'r1', subject: 'English Language', grade: '5*' },
        { id: 'r2', subject: 'Mathematics', grade: '5' },
        { id: 'r3', subject: 'Physics', grade: '5*' },
      ],
    },
  ],
  internships: [],
  activities: [],
  awards: [],
  publications: [],
  hobbies: '',
  references: [],
  custom: [],
  theme: { ...DEFAULT_THEME },
  sectionOrder: ['summary', 'experience', 'education', 'publicExams', 'qualifications', 'skills', 'languages'],
};

const BLANK_DATA = {
  personalInfo: { firstName: '', lastName: '', title: '', email: '', phone: '', location: '', photo: '' },
  summary: '',
  links: [],
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  courses: [],
  qualifications: [],
  publicExams: [],
  internships: [],
  activities: [],
  awards: [],
  publications: [],
  hobbies: '',
  references: [],
  custom: [],
  theme: { ...DEFAULT_THEME },
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
};

// All optional sections that can be added.
export const ALL_SECTIONS = [
  { key: 'summary', label: 'Professional Summary', core: true },
  { key: 'experience', label: 'Employment History', core: true },
  { key: 'education', label: 'Education', core: true },
  { key: 'qualifications', label: 'Professional Qualifications' },
  { key: 'publicExams', label: 'Public Examinations' },
  { key: 'skills', label: 'Skills', core: true },
  { key: 'links', label: 'Links / Websites' },
  { key: 'languages', label: 'Languages' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'courses', label: 'Courses' },
  { key: 'internships', label: 'Internships' },
  { key: 'activities', label: 'Extra-curricular Activities' },
  { key: 'awards', label: 'Awards' },
  { key: 'publications', label: 'Publications' },
  { key: 'hobbies', label: 'Hobbies' },
  { key: 'references', label: 'References' },
];

// Array-typed sections that must always exist on the data object.
const ARRAY_SECTIONS = [
  'links', 'education', 'languages', 'certifications', 'courses', 'references',
  'custom', 'qualifications', 'publicExams', 'internships', 'activities', 'awards', 'publications',
];

const CVS_STORAGE_KEY = 'resume-builder-cvs';
const LAST_ACTIVE_KEY = 'resume-builder-last-active';

function generateId() {
  return 'cv_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9));
}
export function generateItemId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
}

// ── Normalize / migrate any stored data to the current schema ───────────────────
export function normalizeData(raw) {
  const d = { ...BLANK_DATA, ...(raw || {}) };

  d.personalInfo = { ...BLANK_DATA.personalInfo, ...(raw?.personalInfo || {}) };
  d.theme = { ...DEFAULT_THEME, ...(raw?.theme || {}) };

  // Skills: old format was a comma-separated string
  if (typeof raw?.skills === 'string') {
    d.skills = raw.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ id: generateItemId(), name, level: 4 }));
  } else if (!Array.isArray(d.skills)) {
    d.skills = [];
  }

  // Experience: ensure content exists (migrate description + bullets)
  d.experience = (Array.isArray(d.experience) ? d.experience : []).map((e) => {
    if (e.content) return e;
    let html = '';
    if (e.description && e.description.trim()) html += `<p>${e.description}</p>`;
    const bullets = (e.bullets || []).filter((b) => b && b.trim());
    if (bullets.length) html += `<ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;
    return { ...e, content: html };
  });

  // Arrays that must exist
  for (const key of ARRAY_SECTIONS) {
    if (!Array.isArray(d[key])) d[key] = [];
  }
  // Public exams must each carry a results array
  d.publicExams = d.publicExams.map((ex) => ({ ...ex, results: Array.isArray(ex.results) ? ex.results : [] }));
  if (typeof d.hobbies !== 'string') d.hobbies = '';

  // Section order: ensure it contains all enabled sections
  if (!Array.isArray(d.sectionOrder) || d.sectionOrder.length === 0) {
    d.sectionOrder = ['summary', 'experience', 'education', 'skills'];
  }
  return d;
}

// ── Storage helpers ──────────────────────────────────────────────────────────
export function loadAllCVs() {
  try {
    const raw = localStorage.getItem(CVS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export function saveAllCVs(cvs) {
  try {
    localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(cvs));
  } catch { /* ignore */ }
}

export function getLastActiveId() {
  try { return localStorage.getItem(LAST_ACTIVE_KEY) || null; } catch { return null; }
}
export function setLastActiveId(id) {
  try { localStorage.setItem(LAST_ACTIVE_KEY, id); } catch { /* ignore */ }
}

// ── Multi-CV CRUD ───────────────────────────────────────────────────────────
export function initializeCVs() {
  let cvs = loadAllCVs();
  if (!cvs || Object.keys(cvs).length === 0) {
    try {
      const legacy = localStorage.getItem('resume-builder-data');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const id = generateId();
        cvs = {
          [id]: {
            id, name: 'My First CV',
            template: parsed.template || 'modern',
            lastEdited: new Date().toISOString(),
            data: normalizeData(parsed.resumeData || DEFAULT_DATA),
          },
        };
        localStorage.removeItem('resume-builder-data');
        saveAllCVs(cvs);
        setLastActiveId(id);
        return cvs;
      }
    } catch { /* ignore */ }

    const id = generateId();
    cvs = {
      [id]: {
        id, name: 'My First CV', template: 'modern',
        lastEdited: new Date().toISOString(), data: DEFAULT_DATA,
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
    ...source, id: newId, name: source.name + ' (copy)',
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
  const initial = (() => {
    const cvs = loadAllCVs() || {};
    return cvs[cvId] || null;
  })();

  const [data, setDataState] = useState(() => normalizeData(initial?.data || DEFAULT_DATA));
  const [template, setTemplateState] = useState(() => initial?.template || 'modern');
  const debounceTimer = useRef(null);

  const persist = useCallback((newData, newTemplate) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const cvs = loadAllCVs() || {};
      if (!cvs[cvId]) return;
      cvs[cvId].data = newData;
      cvs[cvId].template = newTemplate;
      cvs[cvId].lastEdited = new Date().toISOString();
      saveAllCVs(cvs);
    }, 500);
  }, [cvId]);

  useEffect(() => { persist(data, template); }, [data, template, persist]);

  // Functional or direct update
  const setData = useCallback((updater) => {
    setDataState((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const setTemplate = useCallback((t) => setTemplateState(t), []);

  const setTheme = useCallback((patch) => {
    setDataState((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }));
  }, []);

  const clearAll = useCallback(() => {
    if (window.confirm('Clear all resume content? This cannot be undone.')) {
      setDataState(normalizeData(BLANK_DATA));
    }
  }, []);

  return { data, setData, template, setTemplate, setTheme, clearAll };
}
