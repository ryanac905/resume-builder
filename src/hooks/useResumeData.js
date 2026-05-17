import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_DATA = {
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
      degree: "Bachelor of Science",
      field: 'Computer Science',
      startDate: '2014',
      endDate: '2018',
      gpa: '3.8',
    },
  ],
  skills: 'React, TypeScript, Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, REST APIs, Git',
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

const STORAGE_KEY = 'resume-builder-data';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function useResumeData() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.resumeData || DEFAULT_DATA;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_DATA;
  });

  const [template, setTemplate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.template || 'modern';
      }
    } catch (e) {
      // ignore
    }
    return 'modern';
  });

  const debounceTimer = useRef(null);

  // Debounced save to localStorage
  const saveToStorage = useCallback((resumeData, tmpl) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ resumeData, template: tmpl }));
      } catch (e) {
        // ignore
      }
    }, 500);
  }, []);

  useEffect(() => {
    saveToStorage(data, template);
  }, [data, template, saveToStorage]);

  // Personal info
  const updatePersonalInfo = useCallback((field, value) => {
    setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  }, []);

  // Summary
  const updateSummary = useCallback((value) => {
    setData(prev => ({ ...prev, summary: value }));
  }, []);

  // Experience
  const addExperience = useCallback(() => {
    setData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: generateId(), company: '', role: '', startDate: '', endDate: '', bullets: [''] },
      ],
    }));
  }, []);

  const updateExperience = useCallback((id, field, value) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const removeExperience = useCallback((id) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  }, []);

  const addBullet = useCallback((expId) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
      ),
    }));
  }, []);

  const updateBullet = useCallback((expId, index, value) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e;
        const bullets = [...e.bullets];
        bullets[index] = value;
        return { ...e, bullets };
      }),
    }));
  }, []);

  const removeBullet = useCallback((expId, index) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e;
        const bullets = e.bullets.filter((_, i) => i !== index);
        return { ...e, bullets: bullets.length ? bullets : [''] };
      }),
    }));
  }, []);

  // Education
  const addEducation = useCallback(() => {
    setData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' },
      ],
    }));
  }, []);

  const updateEducation = useCallback((id, field, value) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const removeEducation = useCallback((id) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  }, []);

  // Skills
  const updateSkills = useCallback((value) => {
    setData(prev => ({ ...prev, skills: value }));
  }, []);

  // Projects
  const addProject = useCallback(() => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: generateId(), name: '', description: '', link: '' }],
    }));
  }, []);

  const updateProject = useCallback((id, field, value) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  }, []);

  const removeProject = useCallback((id) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all resume data?')) {
      setData(DEFAULT_DATA);
      setTemplate('modern');
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
