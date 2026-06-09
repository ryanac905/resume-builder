import React from 'react';

function parseSkills(skillsStr) {
  return skillsStr
    ? skillsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : [];
}

const HR = () => (
  <hr style={{ border: 'none', borderTop: '1.5px solid #222', margin: '10px 0' }} />
);

const SectionTitle = ({ children }) => (
  <div>
    <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
      {children}
    </div>
    <HR />
  </div>
);

export default function Classic({ data }) {
  const { personalInfo: p, summary, experience, education, skills, projects } = data;
  const skillList = parseSkills(skills);

  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '13px', lineHeight: '1.6', color: '#111', padding: '36px 44px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {p.firstName} {p.lastName}
        </div>
        {p.title && (
          <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '4px', color: '#333' }}>
            {p.title}
          </div>
        )}
        <div style={{ fontSize: '11.5px', marginTop: '6px', color: '#333', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px' }}>
          {[p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).map((item, i, arr) => (
            <span key={i}>
              {item}
              {i < arr.length - 1 && <span style={{ marginLeft: '6px', color: '#888' }}>•</span>}
            </span>
          ))}
        </div>
      </div>

      <HR />

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '14px' }}>
          <SectionTitle>Professional Summary</SectionTitle>
          <p style={{ margin: '6px 0 0', fontSize: '12.5px', lineHeight: '1.7', color: '#222' }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <SectionTitle>Work Experience</SectionTitle>
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '14px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{exp.role}</span>
                  {exp.company && <span style={{ fontStyle: 'italic', fontSize: '13px' }}> — {exp.company}</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#444', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}
                </div>
              </div>
              {exp.description && exp.description.trim() && (
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', lineHeight: '1.6' }}>{exp.description}</p>
              )}
              {exp.bullets.filter(b => b.trim()).length > 0 && (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px' }}>
                  {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                    <li key={i} style={{ fontSize: '12.5px', marginBottom: '3px' }}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <SectionTitle>Education</SectionTitle>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>{edu.school}</span>
                <div style={{ fontSize: '12.5px', fontStyle: 'italic' }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  {edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#444', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skillList.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <SectionTitle>Skills</SectionTitle>
          <div style={{ marginTop: '6px', fontSize: '12.5px', lineHeight: '1.8' }}>
            {skillList.map((skill, i) => (
              <span key={i}>
                {skill}
                {i < skillList.length - 1 && <span style={{ color: '#888', margin: '0 5px' }}>•</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && projects.some(p => p.name) && (
        <div>
          <SectionTitle>Projects</SectionTitle>
          {projects.filter(p => p.name).map((proj) => (
            <div key={proj.id} style={{ marginBottom: '10px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>{proj.name}</span>
                {proj.link && <span style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#555' }}>{proj.link}</span>}
              </div>
              {proj.description && <p style={{ margin: '3px 0 0', fontSize: '12.5px' }}>{proj.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
