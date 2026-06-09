import React from 'react';
import { FONT_STACKS } from '../hooks/useResumeData';
import { TEMPLATES } from '../resume/templates';

// ── Small building blocks ──────────────────────────────────────────────────────
function LevelDots({ level, accent }) {
  return (
    <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '8px', verticalAlign: 'middle' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: n <= level ? accent : '#d4d4d4',
          }}
        />
      ))}
    </span>
  );
}

function SectionTitle({ children, tpl, accent }) {
  const text = tpl.uppercaseTitles
    ? { textTransform: 'uppercase', letterSpacing: '1.2px' }
    : { letterSpacing: '0.3px' };
  const base = { fontSize: '12px', fontWeight: 700, marginBottom: '8px', ...text };

  if (tpl.sectionTitle === 'rule') {
    return (
      <div style={{ marginBottom: '6px' }}>
        <div style={{ ...base, marginBottom: '3px' }}>{children}</div>
        <hr style={{ border: 'none', borderTop: `1.5px solid ${accent}`, margin: 0 }} />
      </div>
    );
  }
  if (tpl.sectionTitle === 'bar') {
    return (
      <div style={{ ...base, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: '4px' }}>
        {children}
      </div>
    );
  }
  if (tpl.sectionTitle === 'caps') {
    return <div style={{ ...base, color: accent, letterSpacing: '2px' }}>{children}</div>;
  }
  return <div style={{ ...base }}>{children}</div>; // plain
}

// ── Section content renderers ──────────────────────────────────────────────────
function ContactBits(p, sep) {
  return [p.email, p.phone, p.location].filter(Boolean).join(sep);
}

const renderers = {
  summary: (d) => d.summary && d.summary.trim() ? (
    <p style={{ margin: 0 }}>{d.summary}</p>
  ) : null,

  experience: (d, accent) => d.experience.length ? (
    <div>
      {d.experience.map((exp) => (
        <div key={exp.id} style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span style={{ fontWeight: 700 }}>{exp.role}</span>
              {exp.company && <span style={{ color: accent, fontWeight: 600 }}>{exp.role ? ', ' : ''}{exp.company}</span>}
            </div>
            <div style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>
              {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}
            </div>
          </div>
          {exp.content && exp.content.trim() && (
            <div className="rt-content" style={{ marginTop: '3px' }} dangerouslySetInnerHTML={{ __html: exp.content }} />
          )}
        </div>
      ))}
    </div>
  ) : null,

  education: (d, accent) => d.education.length ? (
    <div>
      {d.education.map((edu) => (
        <div key={edu.id} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700 }}>{edu.school}</span>
            <span style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>
              {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
            </span>
          </div>
          <div style={{ fontSize: '0.95em' }}>
            {edu.degree}{edu.field ? ` in ${edu.field}` : ''}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
          </div>
        </div>
      ))}
    </div>
  ) : null,

  skills: (d, accent, inSidebar) => d.skills.length ? (
    <div>
      {d.skills.map((s) => (
        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span>{s.name}</span>
          {s.level > 0 && <LevelDots level={s.level} accent={accent} />}
        </div>
      ))}
    </div>
  ) : null,

  languages: (d, accent) => d.languages.length ? (
    <div>
      {d.languages.map((l) => (
        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span>{l.name}</span>
          {l.level > 0 && <LevelDots level={l.level} accent={accent} />}
        </div>
      ))}
    </div>
  ) : null,

  links: (d, accent) => d.links.length ? (
    <div>
      {d.links.map((l) => (
        <div key={l.id} style={{ marginBottom: '3px' }}>
          {l.label && <span style={{ fontWeight: 600 }}>{l.label}: </span>}
          <span style={{ color: accent }}>{l.url}</span>
        </div>
      ))}
    </div>
  ) : null,

  certifications: (d) => d.certifications.length ? (
    <div>
      {d.certifications.map((c) => (
        <div key={c.id} style={{ marginBottom: '6px' }}>
          <div style={{ fontWeight: 600 }}>{c.name}</div>
          <div style={{ fontSize: '0.92em', color: '#666' }}>
            {[c.issuer, c.date].filter(Boolean).join(' · ')}
          </div>
        </div>
      ))}
    </div>
  ) : null,

  courses: (d) => d.courses.length ? (
    <div>
      {d.courses.map((c) => (
        <div key={c.id} style={{ marginBottom: '6px' }}>
          <div style={{ fontWeight: 600 }}>{c.name}</div>
          <div style={{ fontSize: '0.92em', color: '#666' }}>
            {[c.institution, c.date].filter(Boolean).join(' · ')}
          </div>
        </div>
      ))}
    </div>
  ) : null,

  hobbies: (d) => d.hobbies && d.hobbies.trim() ? (
    <p style={{ margin: 0 }}>{d.hobbies}</p>
  ) : null,

  qualifications: (d, accent) => d.qualifications.length ? (
    <div>
      {d.qualifications.map((q) => (
        <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <div>
            <span style={{ fontWeight: 700 }}>{q.title}</span>
            {q.body && <span style={{ color: '#555' }}>{q.title ? ' — ' : ''}{q.body}</span>}
          </div>
          {q.year && <span style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>{q.year}</span>}
        </div>
      ))}
    </div>
  ) : null,

  publicExams: (d, accent) => d.publicExams.length ? (
    <div>
      {d.publicExams.map((ex) => (
        <div key={ex.id} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700 }}>{ex.exam}</span>
            {ex.year && <span style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>{ex.year}</span>}
          </div>
          {ex.results && ex.results.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '3px' }}>
              <tbody>
                {ex.results.filter((r) => r.subject || r.grade).map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: '1px 0' }}>{r.subject}</td>
                    <td style={{ padding: '1px 0', textAlign: 'right', fontWeight: 600, color: accent, whiteSpace: 'nowrap' }}>{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  ) : null,

  internships: (d, accent) => d.internships.length ? (
    <div>
      {d.internships.map((it) => (
        <div key={it.id} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span style={{ fontWeight: 700 }}>{it.role}</span>
              {it.company && <span style={{ color: accent, fontWeight: 600 }}>{it.role ? ', ' : ''}{it.company}</span>}
            </div>
            <div style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>
              {it.startDate}{it.endDate ? ` – ${it.endDate}` : ''}
            </div>
          </div>
          {it.content && it.content.trim() && (
            <div className="rt-content" style={{ marginTop: '3px' }} dangerouslySetInnerHTML={{ __html: it.content }} />
          )}
        </div>
      ))}
    </div>
  ) : null,

  activities: (d, accent) => d.activities.length ? (
    <div>
      {d.activities.map((a) => (
        <div key={a.id} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span style={{ fontWeight: 700 }}>{a.role}</span>
              {a.organization && <span style={{ color: accent, fontWeight: 600 }}>{a.role ? ', ' : ''}{a.organization}</span>}
            </div>
            <div style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>
              {a.startDate}{a.endDate ? ` – ${a.endDate}` : ''}
            </div>
          </div>
          {a.content && a.content.trim() && (
            <div className="rt-content" style={{ marginTop: '3px' }} dangerouslySetInnerHTML={{ __html: a.content }} />
          )}
        </div>
      ))}
    </div>
  ) : null,

  awards: (d) => d.awards.length ? (
    <div>
      {d.awards.map((a) => (
        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
          <div><span style={{ fontWeight: 600 }}>{a.title}</span>{a.issuer && <span style={{ color: '#555' }}> — {a.issuer}</span>}</div>
          {a.year && <span style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>{a.year}</span>}
        </div>
      ))}
    </div>
  ) : null,

  publications: (d, accent) => d.publications.length ? (
    <div>
      {d.publications.map((p) => (
        <div key={p.id} style={{ marginBottom: '6px' }}>
          <div style={{ fontWeight: 600 }}>{p.title}</div>
          <div style={{ fontSize: '0.92em', color: '#666' }}>
            {[p.publisher, p.year].filter(Boolean).join(' · ')}
            {p.link && <span style={{ color: accent }}>{(p.publisher || p.year) ? ' · ' : ''}{p.link}</span>}
          </div>
        </div>
      ))}
    </div>
  ) : null,

  references: (d) => d.references.length ? (
    <div>
      {d.references.map((r) => (
        <div key={r.id} style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 600 }}>{r.name}{r.position ? `, ${r.position}` : ''}</div>
          {r.company && <div style={{ fontSize: '0.92em' }}>{r.company}</div>}
          {r.contact && <div style={{ fontSize: '0.92em', color: '#666' }}>{r.contact}</div>}
        </div>
      ))}
    </div>
  ) : null,
};

const SECTION_LABELS = {
  summary: 'Profile', experience: 'Employment History', education: 'Education',
  skills: 'Skills', languages: 'Languages', links: 'Links', certifications: 'Certifications',
  courses: 'Courses', hobbies: 'Hobbies', references: 'References',
  qualifications: 'Professional Qualifications', publicExams: 'Public Examinations',
  internships: 'Internships', activities: 'Extra-curricular Activities',
  awards: 'Awards', publications: 'Publications',
};

function renderSection(key, d, accent, tpl, inSidebar) {
  // Custom section: key like "custom:<id>"
  if (key.startsWith('custom:')) {
    const id = key.slice(7);
    const c = d.custom.find((x) => x.id === id);
    if (!c || !((c.content && c.content.trim()) || c.title)) return null;
    return (
      <div key={key} style={{ marginBottom: '16px' }}>
        <SectionTitle tpl={tpl} accent={accent}>{c.title || 'Section'}</SectionTitle>
        {c.content && <div className="rt-content" dangerouslySetInnerHTML={{ __html: c.content }} />}
      </div>
    );
  }
  const fn = renderers[key];
  if (!fn) return null;
  const body = fn(d, accent, inSidebar);
  if (!body) return null;
  const label = d.sectionLabels?.[key] || SECTION_LABELS[key] || key;
  return (
    <div key={key} style={{ marginBottom: '16px' }}>
      <SectionTitle tpl={tpl} accent={accent}>{label}</SectionTitle>
      {body}
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────────
function Header({ d, tpl, accent, onWhite }) {
  const p = d.personalInfo;
  const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  const color = onWhite ? '#fff' : '#1a1a1a';
  const subColor = onWhite ? 'rgba(255,255,255,0.85)' : '#555';
  const align = tpl.headerAlign;

  const photo = p.photo ? (
    <img src={p.photo} alt="" style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : null;

  const nameBlock = (
    <div>
      <div style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.15, color }}>{name || 'Your Name'}</div>
      {p.title && <div style={{ fontSize: '13px', color: subColor, marginTop: '3px', letterSpacing: '0.5px' }}>{p.title}</div>}
    </div>
  );

  const contact = (
    <div style={{ fontSize: '11.5px', color: subColor, lineHeight: 1.7,
      textAlign: align === 'split' ? 'right' : align }}>
      {[p.email, p.phone, p.location].filter(Boolean).map((x, i) => <div key={i}>{x}</div>)}
    </div>
  );

  if (tpl.headerStyle === 'band') {
    return (
      <div style={{ background: accent, padding: '26px 32px', display: 'flex',
        justifyContent: align === 'center' ? 'center' : 'space-between',
        alignItems: 'center', gap: '18px', textAlign: align === 'center' ? 'center' : 'left' }}>
        {photo}
        <div style={{ flex: align === 'center' ? '0 1 auto' : 1 }}>{nameBlock}</div>
        {align !== 'center' && contact}
        {align === 'center' && <div style={{ width: '100%' }} />}
      </div>
    );
  }

  // non-band headers render on white
  const justify = align === 'center' ? 'center' : 'space-between';
  return (
    <div style={{ padding: '28px 36px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px',
        justifyContent: justify, textAlign: align === 'center' ? 'center' : 'left',
        flexDirection: align === 'center' ? 'column' : 'row' }}>
        {photo}
        {nameBlock}
        {align !== 'center' && contact}
      </div>
      {tpl.headerStyle === 'accentline' && (
        <div style={{ width: align === 'center' ? '60px' : '48px', height: '3px', background: accent,
          margin: align === 'center' ? '12px auto 0' : '12px 0 0', borderRadius: '2px' }} />
      )}
      {align === 'center' && contact}
      <hr style={{ border: 'none', borderTop: tpl.headerStyle === 'plain' ? `2px solid ${accent}` : '1px solid #e5e5e5', marginTop: '14px' }} />
    </div>
  );
}

// ── Main renderer ──────────────────────────────────────────────────────────────
export default function ResumeRenderer({ data, template, previewRef }) {
  const tpl = TEMPLATES[template] || TEMPLATES.modern;
  const theme = data.theme || {};
  const accent = theme.accent || tpl.accent;
  const fontFamily = FONT_STACKS[theme.font || tpl.font] || FONT_STACKS.sans;
  const lineHeight = theme.spacing || 1.5;
  const fontScale = theme.fontScale || 1;

  // Build ordered section list including custom sections at the end if not present.
  const order = [...(data.sectionOrder || [])];
  data.custom.forEach((c) => {
    const key = `custom:${c.id}`;
    if (!order.includes(key)) order.push(key);
  });

  const sidebarKeys = tpl.layout === 'sidebar' ? (tpl.sidebar || []) : [];
  const sidebarSections = order.filter((k) => sidebarKeys.includes(k));
  const mainSections = order.filter((k) => !sidebarKeys.includes(k));

  const rootStyle = {
    fontFamily, fontSize: `${13 * fontScale}px`, lineHeight, color: '#222',
    background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column',
  };

  const sidebarOnAccent = tpl.headerStyle === 'sidebarheader';

  return (
    <div ref={previewRef} style={rootStyle}>
      {tpl.headerStyle !== 'sidebarheader' && (
        <Header d={data} tpl={tpl} accent={accent} onWhite={tpl.headerStyle === 'band'} />
      )}

      {tpl.layout === 'sidebar' ? (
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{
            width: '30%', boxSizing: 'border-box', padding: '24px 20px',
            background: sidebarOnAccent ? accent : '#f4f6f8',
            color: sidebarOnAccent ? '#fff' : '#222',
          }}>
            {sidebarOnAccent && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.15 }}>
                  {`${data.personalInfo.firstName || ''} ${data.personalInfo.lastName || ''}`.trim() || 'Your Name'}
                </div>
                {data.personalInfo.title && <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '3px' }}>{data.personalInfo.title}</div>}
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '10px', lineHeight: 1.7 }}>
                  {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).map((x, i) => <div key={i}>{x}</div>)}
                </div>
              </div>
            )}
            {sidebarSections.map((k) => renderSection(k, data, sidebarOnAccent ? '#fff' : accent, tpl, true))}
          </div>
          <div style={{ flex: 1, boxSizing: 'border-box', padding: '24px 28px' }}>
            {mainSections.map((k) => renderSection(k, data, accent, tpl, false))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, boxSizing: 'border-box', padding: '20px 36px 32px' }}>
          {mainSections.map((k) => renderSection(k, data, accent, tpl, false))}
        </div>
      )}
    </div>
  );
}
