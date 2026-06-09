import React, { useState } from 'react';
import RichText from './RichText';
import { TEMPLATE_LIST } from '../resume/templates';
import { ALL_SECTIONS, generateItemId } from '../hooks/useResumeData';

const ACCENT_SWATCHES = ['#1a3a5c', '#2563eb', '#0e7490', '#00b894', '#7c3aed', '#b45309', '#be123c', '#374151', '#111111'];
const SPACING_OPTIONS = [{ v: 1.3, l: 'Tight' }, { v: 1.5, l: 'Normal' }, { v: 1.7, l: 'Relaxed' }, { v: 2.0, l: 'Spacious' }];
const FONT_OPTIONS = [{ v: 'sans', l: 'Sans-serif' }, { v: 'serif', l: 'Serif' }, { v: 'mono', l: 'Monospace' }];
const LEVELS = [
  { v: 0, l: 'No bar' }, { v: 1, l: 'Novice' }, { v: 2, l: 'Beginner' },
  { v: 3, l: 'Skillful' }, { v: 4, l: 'Experienced' }, { v: 5, l: 'Expert' },
];

const clone = (o) => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
const Row = ({ children }) => <div className="form-row">{children}</div>;

export default function Editor({ data, setData, template, setTemplate, setTheme, clearAll, onDownloadPdf, onBackToDashboard }) {
  const [open, setOpen] = useState({}); // collapsed sections by key
  const [dragIdx, setDragIdx] = useState(null);

  const isOpen = (k) => open[k] !== false; // default open
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: p[k] === false ? true : false }));

  // mutate helper
  const upd = (mut) => setData((prev) => { const next = clone(prev); mut(next); return next; });

  // section order helpers
  const order = data.sectionOrder || [];
  const customSectionKeys = data.custom.map((c) => `custom:${c.id}`);
  const fullOrder = [...order, ...customSectionKeys.filter((k) => !order.includes(k))];

  const addableSections = ALL_SECTIONS.filter((s) => !fullOrder.includes(s.key));

  const addSection = (key) => upd((d) => { if (!d.sectionOrder.includes(key)) d.sectionOrder.push(key); });
  const removeSection = (key) => upd((d) => {
    d.sectionOrder = d.sectionOrder.filter((k) => k !== key);
    if (key.startsWith('custom:')) d.custom = d.custom.filter((c) => `custom:${c.id}` !== key);
  });
  const renameSection = (key, current) => {
    const name = window.prompt('Rename section:', current);
    if (name && name.trim()) {
      if (key.startsWith('custom:')) {
        const id = key.slice(7);
        upd((d) => { const c = d.custom.find((x) => x.id === id); if (c) c.title = name.trim(); });
      } else {
        upd((d) => { d.sectionLabels = { ...(d.sectionLabels || {}), [key]: name.trim() }; });
      }
    }
  };

  const onDrop = (toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    upd((d) => {
      const arr = [...fullOrder];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(toIdx, 0, moved);
      d.sectionOrder = arr;
    });
    setDragIdx(null);
  };

  const addCustom = () => upd((d) => {
    const id = generateItemId();
    d.custom.push({ id, title: 'Custom Section', content: '' });
    d.sectionOrder.push(`custom:${id}`);
  });

  // ── array item helpers ──
  const addItem = (key, item) => upd((d) => d[key].push({ id: generateItemId(), ...item }));
  const setItem = (key, id, field, value) => upd((d) => { const it = d[key].find((x) => x.id === id); if (it) it[field] = value; });
  const delItem = (key, id) => upd((d) => { d[key] = d[key].filter((x) => x.id !== id); });

  const sectionLabel = (key) => {
    if (key.startsWith('custom:')) {
      const c = data.custom.find((x) => `custom:${x.id}` === key);
      return c?.title || 'Custom Section';
    }
    return data.sectionLabels?.[key] || ALL_SECTIONS.find((s) => s.key === key)?.label || key;
  };

  // ── render each section body ──
  const renderSectionBody = (key) => {
    if (key.startsWith('custom:')) {
      const id = key.slice(7);
      const c = data.custom.find((x) => x.id === id);
      if (!c) return null;
      return (
        <div className="form-field">
          <RichText value={c.content} onChange={(html) => setItem('custom', id, 'content', html)} placeholder="Write anything here..." />
        </div>
      );
    }
    switch (key) {
      case 'summary':
        return <textarea className="form-textarea" rows={4} value={data.summary} onChange={(e) => upd((d) => { d.summary = e.target.value; })} placeholder="A brief professional summary..." />;

      case 'experience':
        return (
          <>
            {data.experience.map((exp) => (
              <div key={exp.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{exp.role || 'New role'}</span>
                  <button className="btn-remove" onClick={() => delItem('experience', exp.id)}>✕</button></div>
                <Row>
                  <Field label="Job Title" value={exp.role} onChange={(v) => setItem('experience', exp.id, 'role', v)} placeholder="Software Engineer" />
                  <Field label="Employer" value={exp.company} onChange={(v) => setItem('experience', exp.id, 'company', v)} placeholder="Company" />
                </Row>
                <Row>
                  <Field label="Start Date" value={exp.startDate} onChange={(v) => setItem('experience', exp.id, 'startDate', v)} placeholder="Jan 2022" />
                  <Field label="End Date" value={exp.endDate} onChange={(v) => setItem('experience', exp.id, 'endDate', v)} placeholder="Present" />
                </Row>
                <div className="form-field"><label className="form-label">Description</label>
                  <RichText value={exp.content} onChange={(html) => setItem('experience', exp.id, 'content', html)} placeholder="Overview, then use the bullet list button for duties..." />
                </div>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('experience', { role: '', company: '', startDate: '', endDate: '', content: '' })}>+ Add Employment</button>
          </>
        );

      case 'education':
        return (
          <>
            {data.education.map((edu) => (
              <div key={edu.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{edu.school || 'New entry'}</span>
                  <button className="btn-remove" onClick={() => delItem('education', edu.id)}>✕</button></div>
                <Field label="School" value={edu.school} onChange={(v) => setItem('education', edu.id, 'school', v)} placeholder="University" />
                <Row>
                  <Field label="Degree" value={edu.degree} onChange={(v) => setItem('education', edu.id, 'degree', v)} placeholder="B.S." />
                  <Field label="Field" value={edu.field} onChange={(v) => setItem('education', edu.id, 'field', v)} placeholder="Computer Science" />
                </Row>
                <Row>
                  <Field label="Start" value={edu.startDate} onChange={(v) => setItem('education', edu.id, 'startDate', v)} placeholder="2018" />
                  <Field label="End" value={edu.endDate} onChange={(v) => setItem('education', edu.id, 'endDate', v)} placeholder="2022" />
                </Row>
                <Field label="GPA (optional)" value={edu.gpa} onChange={(v) => setItem('education', edu.id, 'gpa', v)} placeholder="3.8" />
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('education', { school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' })}>+ Add Education</button>
          </>
        );

      case 'skills':
      case 'languages': {
        const arrKey = key;
        const arr = data[arrKey];
        return (
          <>
            {arr.map((s) => (
              <div key={s.id} className="level-row">
                <input className="form-input" value={s.name} onChange={(e) => setItem(arrKey, s.id, 'name', e.target.value)} placeholder={key === 'skills' ? 'Skill' : 'Language'} />
                <select className="form-input level-select" value={s.level} onChange={(e) => setItem(arrKey, s.id, 'level', Number(e.target.value))}>
                  {LEVELS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
                </select>
                <button className="btn-remove" onClick={() => delItem(arrKey, s.id)}>✕</button>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem(arrKey, { name: '', level: 4 })}>+ Add {key === 'skills' ? 'Skill' : 'Language'}</button>
          </>
        );
      }

      case 'links':
        return (
          <>
            {data.links.map((l) => (
              <Row key={l.id}>
                <Field label="Label" value={l.label} onChange={(v) => setItem('links', l.id, 'label', v)} placeholder="LinkedIn" />
                <Field label="URL" value={l.url} onChange={(v) => setItem('links', l.id, 'url', v)} placeholder="linkedin.com/in/you" />
                <button className="btn-remove" style={{ alignSelf: 'flex-end', marginBottom: '10px' }} onClick={() => delItem('links', l.id)}>✕</button>
              </Row>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('links', { label: '', url: '' })}>+ Add Link</button>
          </>
        );

      case 'certifications':
        return (
          <>
            {data.certifications.map((c) => (
              <div key={c.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{c.name || 'New certification'}</span>
                  <button className="btn-remove" onClick={() => delItem('certifications', c.id)}>✕</button></div>
                <Field label="Name" value={c.name} onChange={(v) => setItem('certifications', c.id, 'name', v)} placeholder="AWS Certified..." />
                <Row>
                  <Field label="Issuer" value={c.issuer} onChange={(v) => setItem('certifications', c.id, 'issuer', v)} placeholder="Amazon" />
                  <Field label="Date" value={c.date} onChange={(v) => setItem('certifications', c.id, 'date', v)} placeholder="2023" />
                </Row>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })}>+ Add Certification</button>
          </>
        );

      case 'courses':
        return (
          <>
            {data.courses.map((c) => (
              <div key={c.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{c.name || 'New course'}</span>
                  <button className="btn-remove" onClick={() => delItem('courses', c.id)}>✕</button></div>
                <Field label="Course" value={c.name} onChange={(v) => setItem('courses', c.id, 'name', v)} placeholder="Course name" />
                <Row>
                  <Field label="Institution" value={c.institution} onChange={(v) => setItem('courses', c.id, 'institution', v)} placeholder="Provider" />
                  <Field label="Date" value={c.date} onChange={(v) => setItem('courses', c.id, 'date', v)} placeholder="2023" />
                </Row>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('courses', { name: '', institution: '', date: '' })}>+ Add Course</button>
          </>
        );

      case 'hobbies':
        return <textarea className="form-textarea" rows={3} value={data.hobbies} onChange={(e) => upd((d) => { d.hobbies = e.target.value; })} placeholder="Photography, hiking, chess..." />;

      case 'references':
        return (
          <>
            {data.references.map((r) => (
              <div key={r.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{r.name || 'New reference'}</span>
                  <button className="btn-remove" onClick={() => delItem('references', r.id)}>✕</button></div>
                <Row>
                  <Field label="Name" value={r.name} onChange={(v) => setItem('references', r.id, 'name', v)} placeholder="Jane Doe" />
                  <Field label="Position" value={r.position} onChange={(v) => setItem('references', r.id, 'position', v)} placeholder="Manager" />
                </Row>
                <Row>
                  <Field label="Company" value={r.company} onChange={(v) => setItem('references', r.id, 'company', v)} placeholder="Company" />
                  <Field label="Contact" value={r.contact} onChange={(v) => setItem('references', r.id, 'contact', v)} placeholder="email / phone" />
                </Row>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('references', { name: '', position: '', company: '', contact: '' })}>+ Add Reference</button>
          </>
        );

      case 'qualifications':
        return (
          <>
            {data.qualifications.map((q) => (
              <div key={q.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{q.title || 'New qualification'}</span>
                  <button className="btn-remove" onClick={() => delItem('qualifications', q.id)}>✕</button></div>
                <Field label="Qualification / Membership" value={q.title} onChange={(v) => setItem('qualifications', q.id, 'title', v)} placeholder="Member, HKIE (MHKIE)" />
                <Row>
                  <Field label="Awarding Body" value={q.body} onChange={(v) => setItem('qualifications', q.id, 'body', v)} placeholder="HKIE" />
                  <Field label="Year" value={q.year} onChange={(v) => setItem('qualifications', q.id, 'year', v)} placeholder="2022" />
                </Row>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('qualifications', { title: '', body: '', year: '' })}>+ Add Qualification</button>
          </>
        );

      case 'publicExams':
        return (
          <>
            {data.publicExams.map((ex) => (
              <div key={ex.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{ex.exam || 'New examination'}</span>
                  <button className="btn-remove" onClick={() => delItem('publicExams', ex.id)}>✕</button></div>
                <Row>
                  <Field label="Examination" value={ex.exam} onChange={(v) => setItem('publicExams', ex.id, 'exam', v)} placeholder="HKDSE / HKCEE / HKALE" />
                  <Field label="Year" value={ex.year} onChange={(v) => setItem('publicExams', ex.id, 'year', v)} placeholder="2014" />
                </Row>
                <label className="form-label" style={{ marginBottom: '4px', display: 'block' }}>Subjects &amp; Grades</label>
                {(ex.results || []).map((r) => (
                  <div key={r.id} className="level-row">
                    <input className="form-input" value={r.subject} placeholder="Subject" onChange={(e) => upd((d) => { const e2 = d.publicExams.find((x) => x.id === ex.id); const rr = e2.results.find((y) => y.id === r.id); if (rr) rr.subject = e.target.value; })} />
                    <input className="form-input level-select" value={r.grade} placeholder="Grade" onChange={(e) => upd((d) => { const e2 = d.publicExams.find((x) => x.id === ex.id); const rr = e2.results.find((y) => y.id === r.id); if (rr) rr.grade = e.target.value; })} />
                    <button className="btn-remove" onClick={() => upd((d) => { const e2 = d.publicExams.find((x) => x.id === ex.id); e2.results = e2.results.filter((y) => y.id !== r.id); })}>✕</button>
                  </div>
                ))}
                <button className="btn btn-add-entry" onClick={() => upd((d) => { const e2 = d.publicExams.find((x) => x.id === ex.id); e2.results.push({ id: generateItemId(), subject: '', grade: '' }); })}>+ Add Subject</button>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('publicExams', { exam: '', year: '', results: [{ id: generateItemId(), subject: '', grade: '' }] })}>+ Add Examination</button>
          </>
        );

      case 'internships':
      case 'activities': {
        const arrKey = key;
        const orgField = key === 'internships' ? 'company' : 'organization';
        const orgLabel = key === 'internships' ? 'Company' : 'Organization';
        return (
          <>
            {data[arrKey].map((it) => (
              <div key={it.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{it.role || 'New entry'}</span>
                  <button className="btn-remove" onClick={() => delItem(arrKey, it.id)}>✕</button></div>
                <Row>
                  <Field label={key === 'internships' ? 'Role' : 'Title'} value={it.role} onChange={(v) => setItem(arrKey, it.id, 'role', v)} placeholder={key === 'internships' ? 'Intern' : 'Volunteer'} />
                  <Field label={orgLabel} value={it[orgField]} onChange={(v) => setItem(arrKey, it.id, orgField, v)} placeholder={orgLabel} />
                </Row>
                <Row>
                  <Field label="Start" value={it.startDate} onChange={(v) => setItem(arrKey, it.id, 'startDate', v)} placeholder="Jun 2020" />
                  <Field label="End" value={it.endDate} onChange={(v) => setItem(arrKey, it.id, 'endDate', v)} placeholder="Aug 2020" />
                </Row>
                <div className="form-field"><label className="form-label">Description</label>
                  <RichText value={it.content} onChange={(html) => setItem(arrKey, it.id, 'content', html)} placeholder="What you did..." />
                </div>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem(arrKey, { role: '', [orgField]: '', startDate: '', endDate: '', content: '' })}>+ Add {key === 'internships' ? 'Internship' : 'Activity'}</button>
          </>
        );
      }

      case 'awards':
        return (
          <>
            {data.awards.map((a) => (
              <div key={a.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{a.title || 'New award'}</span>
                  <button className="btn-remove" onClick={() => delItem('awards', a.id)}>✕</button></div>
                <Field label="Award" value={a.title} onChange={(v) => setItem('awards', a.id, 'title', v)} placeholder="Best Graduate Award" />
                <Row>
                  <Field label="Issuer" value={a.issuer} onChange={(v) => setItem('awards', a.id, 'issuer', v)} placeholder="University" />
                  <Field label="Year" value={a.year} onChange={(v) => setItem('awards', a.id, 'year', v)} placeholder="2018" />
                </Row>
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('awards', { title: '', issuer: '', year: '' })}>+ Add Award</button>
          </>
        );

      case 'publications':
        return (
          <>
            {data.publications.map((p) => (
              <div key={p.id} className="entry-card">
                <div className="entry-header"><span className="entry-num">{p.title || 'New publication'}</span>
                  <button className="btn-remove" onClick={() => delItem('publications', p.id)}>✕</button></div>
                <Field label="Title" value={p.title} onChange={(v) => setItem('publications', p.id, 'title', v)} placeholder="Paper / article title" />
                <Row>
                  <Field label="Publisher" value={p.publisher} onChange={(v) => setItem('publications', p.id, 'publisher', v)} placeholder="Journal / Publisher" />
                  <Field label="Year" value={p.year} onChange={(v) => setItem('publications', p.id, 'year', v)} placeholder="2021" />
                </Row>
                <Field label="Link (optional)" value={p.link} onChange={(v) => setItem('publications', p.id, 'link', v)} placeholder="doi.org/..." />
              </div>
            ))}
            <button className="btn btn-add-entry" onClick={() => addItem('publications', { title: '', publisher: '', year: '', link: '' })}>+ Add Publication</button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <div className="editor-header-left">
          {onBackToDashboard && <button className="btn btn-back" onClick={onBackToDashboard}>← Dashboard</button>}
          <h1 className="editor-title">Resume Builder</h1>
        </div>
        <div className="editor-actions">
          <button className="btn btn-primary" onClick={onDownloadPdf}>⬇ Download PDF</button>
          <button className="btn btn-ghost" onClick={clearAll}>Clear</button>
        </div>
      </div>

      {/* Customization bar */}
      <div className="custom-bar">
        <div className="custom-group">
          <span className="custom-label">Color</span>
          <div className="swatches">
            {ACCENT_SWATCHES.map((c) => (
              <button key={c} className={`swatch ${data.theme.accent === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setTheme({ accent: c })} title={c} />
            ))}
          </div>
        </div>
        <div className="custom-group">
          <span className="custom-label">Font</span>
          <select className="custom-select" value={data.theme.font} onChange={(e) => setTheme({ font: e.target.value })}>
            {FONT_OPTIONS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
          </select>
        </div>
        <div className="custom-group">
          <span className="custom-label">Spacing</span>
          <select className="custom-select" value={data.theme.spacing} onChange={(e) => setTheme({ spacing: Number(e.target.value) })}>
            {SPACING_OPTIONS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>

      {/* Template selector */}
      <div className="template-selector">
        <div className="template-label">Template</div>
        <div className="template-options">
          {TEMPLATE_LIST.map((t) => (
            <button key={t.id} className={`template-btn ${template === t.id ? 'active' : ''}`} onClick={() => setTemplate(t.id)}>
              <div className="template-thumb-mini" style={{ background: t.accent }}>
                <div className="tt-name" />
                {t.layout === 'sidebar' && <div className="tt-side" />}
              </div>
              <div className="template-btn-name">{t.label}</div>
              <div className="template-btn-desc">{t.category}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="editor-sections">
        {/* Personal Info — always first, not reorderable */}
        <div className="editor-section">
          <button className="section-header" onClick={() => toggle('personal')}>
            <span>Personal Details</span><span className={`chevron ${isOpen('personal') ? 'open' : ''}`}>▼</span>
          </button>
          {isOpen('personal') && (
            <div className="section-body">
              <Row>
                <Field label="First Name" value={data.personalInfo.firstName} onChange={(v) => upd((d) => { d.personalInfo.firstName = v; })} placeholder="Alex" />
                <Field label="Last Name" value={data.personalInfo.lastName} onChange={(v) => upd((d) => { d.personalInfo.lastName = v; })} placeholder="Johnson" />
              </Row>
              <Field label="Job Title" value={data.personalInfo.title} onChange={(v) => upd((d) => { d.personalInfo.title = v; })} placeholder="Software Engineer" />
              <Row>
                <Field label="Email" value={data.personalInfo.email} onChange={(v) => upd((d) => { d.personalInfo.email = v; })} placeholder="you@email.com" />
                <Field label="Phone" value={data.personalInfo.phone} onChange={(v) => upd((d) => { d.personalInfo.phone = v; })} placeholder="+1 (555) 000-0000" />
              </Row>
              <Field label="Location" value={data.personalInfo.location} onChange={(v) => upd((d) => { d.personalInfo.location = v; })} placeholder="City, Country" />
            </div>
          )}
        </div>

        {/* Reorderable sections */}
        {fullOrder.map((key, idx) => (
          <div
            key={key}
            className={`editor-section ${dragIdx === idx ? 'dragging' : ''}`}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(idx)}
            onDragEnd={() => setDragIdx(null)}
          >
            <div className="section-header section-header-row">
              <span className="drag-handle" title="Drag to reorder">⋮⋮</span>
              <button className="section-title-btn" onClick={() => toggle(key)}>{sectionLabel(key)}</button>
              <div className="section-tools">
                <button className="section-tool" title="Rename" onClick={() => renameSection(key, sectionLabel(key))}>✎</button>
                <button className="section-tool section-tool-danger" title="Remove section" onClick={() => removeSection(key)}>🗑</button>
                <button className="section-tool" onClick={() => toggle(key)}><span className={`chevron ${isOpen(key) ? 'open' : ''}`}>▼</span></button>
              </div>
            </div>
            {isOpen(key) && <div className="section-body">{renderSectionBody(key)}</div>}
          </div>
        ))}

        {/* Add section */}
        <div className="add-section-area">
          <div className="add-section-title">Add a section</div>
          <div className="add-section-btns">
            {addableSections.map((s) => (
              <button key={s.key} className="add-section-btn" onClick={() => addSection(s.key)}>+ {s.label}</button>
            ))}
            <button className="add-section-btn add-section-custom" onClick={addCustom}>+ Custom Section</button>
          </div>
        </div>
      </div>
    </div>
  );
}
