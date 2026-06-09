import React, { useState } from 'react';

function SectionHeader({ title, isOpen, onToggle }) {
  return (
    <button className="section-header" onClick={onToggle}>
      <span>{title}</span>
      <span className={`chevron ${isOpen ? 'open' : ''}`}>&#9660;</span>
    </button>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function FormRow({ children }) {
  return <div className="form-row">{children}</div>;
}

export default function Editor({
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
  onDownloadPdf,
  onBackToDashboard,
}) {
  const [openSections, setOpenSections] = useState({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    skills: false,
    projects: false,
  });

  const toggle = (section) =>
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  return (
    <div className="editor-panel">
      {/* Top actions */}
      <div className="editor-header">
        <div className="editor-header-left">
          {onBackToDashboard && (
            <button className="btn btn-back" onClick={onBackToDashboard} title="Back to Dashboard">
              &#8592; Dashboard
            </button>
          )}
          <h1 className="editor-title">Resume Builder</h1>
        </div>
        <div className="editor-actions">
          <button className="btn btn-primary" onClick={onDownloadPdf}>
            &#8659; Download PDF
          </button>
          <button className="btn btn-ghost" onClick={clearAll}>
            Clear All
          </button>
        </div>
      </div>

      {/* Template selector */}
      <div className="template-selector">
        <div className="template-label">Template</div>
        <div className="template-options">
          {[
            { id: 'modern', label: 'Modern', desc: 'Navy header · Sidebar' },
            { id: 'classic', label: 'Classic', desc: 'Serif · Single column' },
            { id: 'minimal', label: 'Minimal', desc: 'Clean · Whitespace' },
          ].map(t => (
            <button
              key={t.id}
              className={`template-btn ${template === t.id ? 'active' : ''}`}
              onClick={() => setTemplate(t.id)}
            >
              <div className="template-thumb">
                <TemplateThumbnail id={t.id} />
              </div>
              <div className="template-btn-name">{t.label}</div>
              <div className="template-btn-desc">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="editor-sections">
        {/* Personal Info */}
        <div className="editor-section">
          <SectionHeader title="Personal Info" isOpen={openSections.personal} onToggle={() => toggle('personal')} />
          {openSections.personal && (
            <div className="section-body">
              <FormRow>
                <FormField label="First Name" value={data.personalInfo.firstName} onChange={v => updatePersonalInfo('firstName', v)} placeholder="Alex" />
                <FormField label="Last Name" value={data.personalInfo.lastName} onChange={v => updatePersonalInfo('lastName', v)} placeholder="Johnson" />
              </FormRow>
              <FormField label="Job Title / Role" value={data.personalInfo.title} onChange={v => updatePersonalInfo('title', v)} placeholder="Software Engineer" />
              <FormRow>
                <FormField label="Email" value={data.personalInfo.email} onChange={v => updatePersonalInfo('email', v)} type="email" placeholder="you@email.com" />
                <FormField label="Phone" value={data.personalInfo.phone} onChange={v => updatePersonalInfo('phone', v)} placeholder="+1 (555) 000-0000" />
              </FormRow>
              <FormField label="Location" value={data.personalInfo.location} onChange={v => updatePersonalInfo('location', v)} placeholder="City, State" />
              <FormRow>
                <FormField label="LinkedIn" value={data.personalInfo.linkedin} onChange={v => updatePersonalInfo('linkedin', v)} placeholder="linkedin.com/in/..." />
                <FormField label="Website" value={data.personalInfo.website} onChange={v => updatePersonalInfo('website', v)} placeholder="yoursite.com" />
              </FormRow>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="editor-section">
          <SectionHeader title="Summary / Objective" isOpen={openSections.summary} onToggle={() => toggle('summary')} />
          {openSections.summary && (
            <div className="section-body">
              <textarea
                className="form-textarea"
                value={data.summary}
                onChange={e => updateSummary(e.target.value)}
                placeholder="A brief professional summary highlighting your key skills and career goals..."
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="editor-section">
          <SectionHeader title={`Work Experience (${data.experience.length})`} isOpen={openSections.experience} onToggle={() => toggle('experience')} />
          {openSections.experience && (
            <div className="section-body">
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-num">#{index + 1}</span>
                    <button className="btn-remove" onClick={() => removeExperience(exp.id)} title="Remove">&#10005;</button>
                  </div>
                  <FormRow>
                    <FormField label="Company" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} placeholder="Company Name" />
                    <FormField label="Role / Title" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} placeholder="Job Title" />
                  </FormRow>
                  <FormRow>
                    <FormField label="Start Date" value={exp.startDate} onChange={v => updateExperience(exp.id, 'startDate', v)} placeholder="Jan 2022" />
                    <FormField label="End Date" value={exp.endDate} onChange={v => updateExperience(exp.id, 'endDate', v)} placeholder="Present" />
                  </FormRow>
                  <div className="form-field">
                    <label className="form-label">Description (optional)</label>
                    <textarea
                      className="form-textarea"
                      value={exp.description || ''}
                      onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="A short overview of the role, project, or contract scope..."
                      rows={2}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Bullet Points</label>
                    {exp.bullets.map((bullet, i) => (
                      <div key={i} className="bullet-row">
                        <textarea
                          className="form-input bullet-input"
                          value={bullet}
                          onChange={e => updateBullet(exp.id, i, e.target.value)}
                          placeholder="Describe an achievement or responsibility..."
                          rows={2}
                        />
                        <button
                          className="btn-remove-bullet"
                          onClick={() => removeBullet(exp.id, i)}
                          title="Remove bullet"
                          disabled={exp.bullets.length === 1}
                        >
                          &#10005;
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-add-bullet" onClick={() => addBullet(exp.id)}>
                      + Add Bullet
                    </button>
                  </div>
                </div>
              ))}
              <button className="btn btn-add-entry" onClick={addExperience}>+ Add Experience</button>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="editor-section">
          <SectionHeader title={`Education (${data.education.length})`} isOpen={openSections.education} onToggle={() => toggle('education')} />
          {openSections.education && (
            <div className="section-body">
              {data.education.map((edu, index) => (
                <div key={edu.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-num">#{index + 1}</span>
                    <button className="btn-remove" onClick={() => removeEducation(edu.id)} title="Remove">&#10005;</button>
                  </div>
                  <FormField label="School / University" value={edu.school} onChange={v => updateEducation(edu.id, 'school', v)} placeholder="University Name" />
                  <FormRow>
                    <FormField label="Degree" value={edu.degree} onChange={v => updateEducation(edu.id, 'degree', v)} placeholder="B.S., M.S., Ph.D." />
                    <FormField label="Field of Study" value={edu.field} onChange={v => updateEducation(edu.id, 'field', v)} placeholder="Computer Science" />
                  </FormRow>
                  <FormRow>
                    <FormField label="Start Year" value={edu.startDate} onChange={v => updateEducation(edu.id, 'startDate', v)} placeholder="2018" />
                    <FormField label="End Year" value={edu.endDate} onChange={v => updateEducation(edu.id, 'endDate', v)} placeholder="2022" />
                  </FormRow>
                  <FormField label="GPA (optional)" value={edu.gpa} onChange={v => updateEducation(edu.id, 'gpa', v)} placeholder="3.9" />
                </div>
              ))}
              <button className="btn btn-add-entry" onClick={addEducation}>+ Add Education</button>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="editor-section">
          <SectionHeader title="Skills" isOpen={openSections.skills} onToggle={() => toggle('skills')} />
          {openSections.skills && (
            <div className="section-body">
              <div className="form-field">
                <label className="form-label">Skills (comma-separated)</label>
                <textarea
                  className="form-textarea"
                  value={data.skills}
                  onChange={e => updateSkills(e.target.value)}
                  placeholder="React, Node.js, Python, PostgreSQL, Docker..."
                  rows={3}
                />
              </div>
              {data.skills && (
                <div className="skills-preview">
                  {data.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="editor-section">
          <SectionHeader title={`Projects (${data.projects ? data.projects.length : 0})`} isOpen={openSections.projects} onToggle={() => toggle('projects')} />
          {openSections.projects && (
            <div className="section-body">
              {data.projects && data.projects.map((proj, index) => (
                <div key={proj.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-num">#{index + 1}</span>
                    <button className="btn-remove" onClick={() => removeProject(proj.id)} title="Remove">&#10005;</button>
                  </div>
                  <FormRow>
                    <FormField label="Project Name" value={proj.name} onChange={v => updateProject(proj.id, 'name', v)} placeholder="My Awesome Project" />
                    <FormField label="Link (optional)" value={proj.link} onChange={v => updateProject(proj.id, 'link', v)} placeholder="github.com/you/project" />
                  </FormRow>
                  <div className="form-field">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={proj.description}
                      onChange={e => updateProject(proj.id, 'description', e.target.value)}
                      placeholder="Brief description of the project, tech used, and impact..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              <button className="btn btn-add-entry" onClick={addProject}>+ Add Project</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mini SVG thumbnail for each template
function TemplateThumbnail({ id }) {
  if (id === 'modern') {
    return (
      <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="60" height="80" fill="#f0f4f8" />
        <rect width="60" height="20" fill="#1a3a5c" />
        <rect x="3" y="5" width="30" height="4" rx="1" fill="#fff" opacity="0.9" />
        <rect x="3" y="11" width="18" height="2" rx="1" fill="#fff" opacity="0.6" />
        <rect width="16" height="80" x="0" y="20" fill="#e8f0f7" />
        <rect x="2" y="24" width="12" height="2" rx="1" fill="#1a3a5c" opacity="0.7" />
        <rect x="2" y="28" width="10" height="1.5" rx="0.5" fill="#555" opacity="0.5" />
        <rect x="2" y="31" width="11" height="1.5" rx="0.5" fill="#555" opacity="0.5" />
        <rect x="2" y="34" width="9" height="1.5" rx="0.5" fill="#555" opacity="0.5" />
        <rect x="19" y="24" width="18" height="2" rx="1" fill="#1a3a5c" opacity="0.7" />
        <rect x="19" y="28" width="35" height="1.5" rx="0.5" fill="#555" opacity="0.4" />
        <rect x="19" y="31" width="32" height="1.5" rx="0.5" fill="#555" opacity="0.4" />
        <rect x="19" y="34" width="38" height="1.5" rx="0.5" fill="#555" opacity="0.4" />
        <rect x="19" y="40" width="18" height="2" rx="1" fill="#1a3a5c" opacity="0.7" />
        <rect x="19" y="44" width="35" height="1.5" rx="0.5" fill="#555" opacity="0.4" />
        <rect x="19" y="47" width="30" height="1.5" rx="0.5" fill="#555" opacity="0.4" />
      </svg>
    );
  }
  if (id === 'classic') {
    return (
      <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="60" height="80" fill="#fafafa" />
        <rect x="10" y="6" width="40" height="5" rx="1" fill="#111" opacity="0.85" />
        <rect x="15" y="13" width="30" height="2" rx="0.5" fill="#555" opacity="0.6" />
        <rect x="5" y="18" width="50" height="1" fill="#111" opacity="0.8" />
        <rect x="5" y="22" width="20" height="2" rx="0.5" fill="#111" opacity="0.7" />
        <rect x="5" y="25" width="50" height="1" fill="#111" opacity="0.4" />
        <rect x="5" y="28" width="50" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
        <rect x="5" y="31" width="45" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
        <rect x="5" y="36" width="20" height="2" rx="0.5" fill="#111" opacity="0.7" />
        <rect x="5" y="39" width="50" height="1" fill="#111" opacity="0.4" />
        <rect x="5" y="42" width="50" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
        <rect x="5" y="45" width="45" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
        <rect x="5" y="48" width="40" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
        <rect x="5" y="53" width="20" height="2" rx="0.5" fill="#111" opacity="0.7" />
        <rect x="5" y="56" width="50" height="1" fill="#111" opacity="0.4" />
        <rect x="5" y="59" width="50" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
        <rect x="5" y="62" width="42" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
      </svg>
    );
  }
  // minimal
  return (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="80" fill="#fff" />
      <rect x="5" y="7" width="32" height="7" rx="1" fill="#1a1a1a" opacity="0.85" />
      <rect x="5" y="16" width="18" height="2" rx="0.5" fill="#555" opacity="0.6" />
      <rect x="5" y="20" width="12" height="2.5" rx="1" fill="#00b894" />
      <rect x="5" y="25" width="45" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
      <rect x="5" y="28" width="40" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
      <rect x="5" y="34" width="15" height="2" rx="0.5" fill="#00b894" opacity="0.9" />
      <rect x="5" y="39" width="50" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
      <rect x="5" y="42" width="45" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
      <rect x="5" y="45" width="48" height="1.2" rx="0.3" fill="#555" opacity="0.4" />
      <rect x="5" y="50" width="15" height="2" rx="0.5" fill="#00b894" opacity="0.9" />
      <rect x="5" y="55" width="8" height="5" rx="2.5" fill="none" stroke="#00b894" strokeWidth="1" />
      <rect x="15" y="55" width="10" height="5" rx="2.5" fill="none" stroke="#00b894" strokeWidth="1" />
      <rect x="27" y="55" width="9" height="5" rx="2.5" fill="none" stroke="#00b894" strokeWidth="1" />
    </svg>
  );
}
