// Template style presets. Each template is a config consumed by ResumeRenderer.
// layout: 'sidebar' (left column) or 'single' (one column).

export const TEMPLATES = {
  modern: {
    label: 'Modern',
    category: 'Modern',
    layout: 'sidebar',
    accent: '#1a3a5c',
    font: 'sans',
    headerStyle: 'band',        // colored full-width band
    headerAlign: 'split',       // name left, contact right
    sidebar: ['skills', 'languages', 'education', 'links', 'hobbies'],
    sectionTitle: 'bar',        // underline bar
    uppercaseTitles: true,
  },
  classic: {
    label: 'Classic',
    category: 'Professional',
    layout: 'single',
    accent: '#222222',
    font: 'serif',
    headerStyle: 'centered',
    headerAlign: 'center',
    sectionTitle: 'rule',       // title + horizontal rule
    uppercaseTitles: true,
  },
  minimal: {
    label: 'Minimal',
    category: 'Simple',
    layout: 'single',
    accent: '#00b894',
    font: 'sans',
    headerStyle: 'accentline',
    headerAlign: 'left',
    sectionTitle: 'caps',       // small caps accent label
    uppercaseTitles: true,
  },
  professional: {
    label: 'Professional',
    category: 'Professional',
    layout: 'sidebar',
    accent: '#2563eb',
    font: 'sans',
    headerStyle: 'plain',
    headerAlign: 'left',
    sidebar: ['skills', 'links', 'languages', 'certifications'],
    sectionTitle: 'bar',
    uppercaseTitles: true,
  },
  executive: {
    label: 'Executive',
    category: 'Professional',
    layout: 'single',
    accent: '#374151',
    font: 'serif',
    headerStyle: 'band',
    headerAlign: 'center',
    sectionTitle: 'rule',
    uppercaseTitles: true,
  },
  creative: {
    label: 'Creative',
    category: 'Creative',
    layout: 'sidebar',
    accent: '#7c3aed',
    font: 'sans',
    headerStyle: 'sidebarheader', // name sits in the colored sidebar
    headerAlign: 'left',
    sidebar: ['skills', 'languages', 'links', 'hobbies'],
    sectionTitle: 'caps',
    uppercaseTitles: true,
  },
  simple: {
    label: 'Simple (ATS)',
    category: 'Simple',
    layout: 'single',
    accent: '#111111',
    font: 'sans',
    headerStyle: 'plain',
    headerAlign: 'left',
    sectionTitle: 'plain',
    uppercaseTitles: true,
  },
  elegant: {
    label: 'Elegant',
    category: 'Creative',
    layout: 'single',
    accent: '#b45309',
    font: 'serif',
    headerStyle: 'accentline',
    headerAlign: 'center',
    sectionTitle: 'caps',
    uppercaseTitles: false,
  },
};

export const TEMPLATE_LIST = Object.entries(TEMPLATES).map(([id, t]) => ({ id, ...t }));
