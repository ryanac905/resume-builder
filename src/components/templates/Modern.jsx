import React from 'react';
import { getExpContentHtml, hasExpContent } from '../../lib/expContent';

const ACCENT = '#1a3a5c';
const LIGHT_ACCENT = '#e8f0f7';

function parseSkills(skillsStr) {
  return skillsStr
    ? skillsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : [];
}

export default function Modern({ data }) {
  const { personalInfo: p, summary, experience, education, skills, projects } = data;
  const skillList = parseSkills(skills);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: '13px', lineHeight: '1.5', color: '#222', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: ACCENT, color: '#fff', padding: '28px 32px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '0.5px', lineHeight: 1.2 }}>
            {p.firstName} {p.lastName}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '400', marginTop: '4px', opacity: 0.9, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {p.title}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '11.5px', opacity: 0.9, lineHeight: 1.7 }}>
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.linkedin && <div>{p.linkedin}</div>}
          {p.website && <div>{p.website}</div>}
        </div>
      </div>

      {/* Body: sidebar + main */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: '27%', background: LIGHT_ACCENT, padding: '24px 18px', boxSizing: 'border-box' }}>
          {/* Skills */}
          {skillList.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: ACCENT, borderBottom: `2px solid ${ACCENT}`, paddingBottom: '4px', marginBottom: '10px' }}>
                Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {skillList.map((skill, i) => (
                  <span key={i} style={{ background: ACCENT, color: '#fff', borderRadius: '3px', padding: '3px 8px', fontSize: '11px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: ACCENT, borderBottom: `2px solid ${ACCENT}`, paddingBottom: '4px', marginBottom: '10px' }}>
                Education
              </div>
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: '600', fontSize: '12px' }}>{edu.school}</div>
                  <div style={{ fontSize: '11.5px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                  <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                    {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
                  </div>
                  {edu.gpa && <div style={{ fontSize: '11px', color: '#555' }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '24px 28px', boxSizing: 'border-box' }}>
          {/* Summary */}
          {summary && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: ACCENT, borderBottom: `2px solid ${ACCENT}`, paddingBottom: '4px', marginBottom: '8px' }}>
                Summary
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#333', lineHeight: '1.6' }}>{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: ACCENT, borderBottom: `2px solid ${ACCENT}`, paddingBottom: '4px', marginBottom: '10px' }}>
                Experience
              </div>
              {experience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>{exp.role}</div>
                      <div style={{ fontSize: '12px', color: ACCENT, fontWeight: '500' }}>{exp.company}</div>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#666', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}
                    </div>
                  </div>
                  {hasExpContent(exp) && (
                    <div
                      className="rt-content"
                      style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}
                      dangerouslySetInnerHTML={{ __html: getExpContentHtml(exp) }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && projects.some(p => p.name) && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: ACCENT, borderBottom: `2px solid ${ACCENT}`, paddingBottom: '4px', marginBottom: '10px' }}>
                Projects
              </div>
              {projects.filter(p => p.name).map((proj) => (
                <div key={proj.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: '700', fontSize: '12.5px' }}>{proj.name}</div>
                    {proj.link && <div style={{ fontSize: '11px', color: ACCENT }}>{proj.link}</div>}
                  </div>
                  {proj.description && <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#444' }}>{proj.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
