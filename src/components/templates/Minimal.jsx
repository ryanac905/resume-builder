import React from 'react';

const ACCENT = '#00b894';

function parseSkills(skillsStr) {
  return skillsStr
    ? skillsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : [];
}

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: ACCENT, marginBottom: '12px', marginTop: '22px' }}>
    {children}
  </div>
);

export default function Minimal({ data }) {
  const { personalInfo: p, summary, experience, education, skills, projects } = data;
  const skillList = parseSkills(skills);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: '13px', lineHeight: '1.6', color: '#1a1a1a', padding: '48px 52px' }}>
      {/* Header */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '32px', fontWeight: '300', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          {p.firstName} <strong style={{ fontWeight: '700' }}>{p.lastName}</strong>
        </div>
        {p.title && (
          <div style={{ fontSize: '14px', color: '#555', marginTop: '3px', fontWeight: '400' }}>
            {p.title}
          </div>
        )}
        {/* Accent line */}
        <div style={{ width: '48px', height: '3px', background: ACCENT, marginTop: '10px', borderRadius: '2px' }} />
      </div>

      {/* Contact row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '12px', fontSize: '11.5px', color: '#555' }}>
        {p.email && <span>{p.email}</span>}
        {p.phone && <span>{p.phone}</span>}
        {p.location && <span>{p.location}</span>}
        {p.linkedin && <span>{p.linkedin}</span>}
        {p.website && <span>{p.website}</span>}
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <SectionTitle>About</SectionTitle>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#333', lineHeight: '1.7', maxWidth: '620px' }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <SectionTitle>Experience</SectionTitle>
          {experience.map((exp, idx) => (
            <div key={exp.id} style={{ marginBottom: idx < experience.length - 1 ? '18px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '13.5px' }}>{exp.role}</span>
                  {exp.company && <span style={{ color: ACCENT, fontWeight: '500', fontSize: '13px' }}> · {exp.company}</span>}
                </div>
                <div style={{ fontSize: '11.5px', color: '#888', whiteSpace: 'nowrap', marginLeft: '8px', marginTop: '2px' }}>
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}
                </div>
              </div>
              {exp.description && exp.description.trim() && (
                <p style={{ margin: '5px 0 0', fontSize: '12.5px', color: '#444', lineHeight: '1.6', maxWidth: '620px' }}>{exp.description}</p>
              )}
              {exp.bullets.filter(b => b.trim()).length > 0 && (
                <ul style={{ margin: '6px 0 0', paddingLeft: '16px' }}>
                  {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                    <li key={i} style={{ fontSize: '12.5px', marginBottom: '3px', color: '#333' }}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skillList.length > 0 && (
        <div>
          <SectionTitle>Skills</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {skillList.map((skill, i) => (
              <span
                key={i}
                style={{
                  border: `1.5px solid ${ACCENT}`,
                  borderRadius: '20px',
                  padding: '3px 12px',
                  fontSize: '11.5px',
                  color: '#1a1a1a',
                  background: 'transparent',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <SectionTitle>Education</SectionTitle>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{edu.school}</div>
                <div style={{ fontSize: '12.5px', color: '#555', marginTop: '1px' }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  {edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
                </div>
              </div>
              <div style={{ fontSize: '11.5px', color: '#888', whiteSpace: 'nowrap', marginLeft: '8px', marginTop: '2px' }}>
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && projects.some(p => p.name) && (
        <div>
          <SectionTitle>Projects</SectionTitle>
          {projects.filter(p => p.name).map((proj) => (
            <div key={proj.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>{proj.name}</span>
                {proj.link && <span style={{ fontSize: '11.5px', color: ACCENT }}>{proj.link}</span>}
              </div>
              {proj.description && <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#444' }}>{proj.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
