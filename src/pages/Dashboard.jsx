import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  initializeCVs,
  loadAllCVs,
  saveAllCVs,
  createCV,
  duplicateCV,
  renameCV,
  deleteCV,
  setLastActiveId,
} from '../hooks/useResumeData';
import { useAuth } from '../context/AuthContext';
import { useCloudSync } from '../hooks/useCloudSync';
import '../styles/dashboard.css';

const TEMPLATE_META = {
  modern:  { label: 'Modern',  color: '#1a3a5c' },
  classic: { label: 'Classic', color: '#4b5563' },
  minimal: { label: 'Minimal', color: '#00b894' },
};

function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

function MiniPreview({ data }) {
  const firstName = data?.personalInfo?.firstName || '';
  const lastName = data?.personalInfo?.lastName || '';
  const title = data?.personalInfo?.title || '';
  const summary = data?.summary || '';
  const exp = data?.experience || [];

  return (
    <div className="mini-preview">
      <div className="mini-preview-name">{firstName} {lastName}</div>
      {title && <div className="mini-preview-title">{title}</div>}
      {summary && <div className="mini-preview-summary">{summary}</div>}
      {exp.length > 0 && (
        <div className="mini-preview-section">
          <div className="mini-preview-section-label">Experience</div>
          {exp.slice(0, 2).map((e) => (
            <div key={e.id} className="mini-preview-exp">
              <span className="mini-preview-role">{e.role}</span>
              {e.company && <span className="mini-preview-company"> · {e.company}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CVCard({ cv, onOpen, onDuplicate, onDelete, onRenameStart }) {
  const meta = TEMPLATE_META[cv.template] || TEMPLATE_META.modern;

  return (
    <div className="cv-card" onClick={() => onOpen(cv.id)}>
      {/* Colored top bar */}
      <div className="cv-card-bar" style={{ background: meta.color }} />

      {/* Card body */}
      <div className="cv-card-body">
        {/* Header row */}
        <div className="cv-card-header">
          <div
            className="cv-card-template-badge"
            style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}44` }}
          >
            {meta.label}
          </div>
        </div>

        {/* CV name */}
        <div
          className="cv-card-name"
          title="Click to rename"
          onClick={(e) => {
            e.stopPropagation();
            onRenameStart(cv.id, cv.name);
          }}
        >
          {cv.name}
        </div>

        {/* Last edited */}
        <div className="cv-card-date">Edited {relativeTime(cv.lastEdited)}</div>

        {/* Mini preview */}
        <div className="cv-card-preview">
          <MiniPreview data={cv.data} />
        </div>
      </div>

      {/* Action row */}
      <div className="cv-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="cv-card-btn cv-card-btn-primary"
          onClick={() => onOpen(cv.id)}
        >
          Open
        </button>
        <div className="cv-card-icon-btns">
          <button
            className="cv-card-icon-btn"
            title="Duplicate"
            onClick={() => onDuplicate(cv.id)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          <button
            className="cv-card-icon-btn"
            title="Rename"
            onClick={() => onRenameStart(cv.id, cv.name)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className="cv-card-icon-btn cv-card-icon-btn-danger"
            title="Delete"
            onClick={() => onDelete(cv.id, cv.name)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function RenameModal({ id, initialName, onConfirm, onCancel }) {
  const [value, setValue] = useState(initialName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) onConfirm(id, value.trim());
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Rename CV</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="modal-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            placeholder="CV name"
          />
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Auth header widget ----
function AuthWidget({ user, isSyncing, lastSynced, onSignOut, onManualSync }) {
  const { signInWithEmail, magicLinkSent, setMagicLinkSent } = useAuth();
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) {
    if (magicLinkSent) {
      return (
        <div className="auth-magic-sent">
          <span>📧 Check your email for a sign-in link!</span>
          <button className="auth-signout" onClick={() => { setMagicLinkSent(false); setShowForm(false); }}>Dismiss</button>
        </div>
      );
    }
    if (showForm) {
      const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setErrorMsg('');
        const { error } = await signInWithEmail(email);
        setSending(false);
        if (error) setErrorMsg(error);
      };
      return (
        <form className="auth-email-form" onSubmit={handleSubmit}>
          <input
            className="auth-email-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <button className="auth-btn" type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send link'}
          </button>
          <button type="button" className="auth-signout" onClick={() => setShowForm(false)}>Cancel</button>
          {errorMsg && <span className="auth-error">{errorMsg}</span>}
        </form>
      );
    }
    return (
      <div className="auth-signin-options">
        <button className="auth-btn auth-btn-google" onClick={signInWithGoogle} title="Sign in with Google">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button className="auth-btn" onClick={() => setShowForm(true)} title="Sign in with Email">
          ✉ Email
        </button>
      </div>
    );
  }

  const avatar = user.user_metadata?.avatar_url;
  const userEmail = user.email || user.user_metadata?.email || '';
  const initials = userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <div className="auth-user">
      {avatar ? (
        <img className="auth-avatar" src={avatar} alt={userEmail} referrerPolicy="no-referrer" />
      ) : (
        <div className="auth-avatar auth-avatar-initials">{initials}</div>
      )}
      <span className="auth-email">{userEmail}</span>
      <button
        className="auth-sync-btn"
        onClick={onManualSync}
        disabled={isSyncing}
        title="Sync now"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}
        >
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
      </button>
      {lastSynced && (
        <span className="sync-status">
          {isSyncing ? '☁ Syncing...' : `☁ Synced ${relativeTime(lastSynced.toISOString())}`}
        </span>
      )}
      {isSyncing && !lastSynced && (
        <span className="sync-status">☁ Syncing...</span>
      )}
      <button className="auth-signout" onClick={onSignOut}>Sign out</button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [cvs, setCVs] = useState(() => initializeCVs());
  const [renaming, setRenaming] = useState(null);
  const { user, signInWithGoogle, signOut } = useAuth();
  const { isSyncing, lastSynced, syncFromCloud, syncToCloud, saveCV, deleteCloudCV } = useCloudSync();

  const refresh = useCallback(() => {
    setCVs({ ...(loadAllCVs() || {}) });
  }, []);

  // On login: pull CVs from cloud, merge, then push local ones up
  useEffect(() => {
    if (!user) return;
    (async () => {
      await syncFromCloud(user.id);
      refresh();
      // After merge, push everything to cloud
      const merged = loadAllCVs() || {};
      await syncToCloud(user.id, merged);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleOpen = useCallback(
    (id) => {
      setLastActiveId(id);
      navigate(`/editor/${id}`);
    },
    [navigate]
  );

  const handleCreateNew = useCallback(async () => {
    const name = 'Untitled CV';
    const cv = createCV(name);
    if (user) await saveCV(user.id, cv);
    navigate(`/editor/${cv.id}`);
  }, [navigate, user, saveCV]);

  const handleDuplicate = useCallback(
    async (id) => {
      const copy = duplicateCV(id);
      refresh();
      if (user && copy) await saveCV(user.id, copy);
    },
    [refresh, user, saveCV]
  );

  const handleDelete = useCallback(
    async (id, name) => {
      if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
        deleteCV(id);
        refresh();
        if (user) await deleteCloudCV(user.id, id);
      }
    },
    [refresh, user, deleteCloudCV]
  );

  const handleRenameStart = useCallback((id, name) => {
    setRenaming({ id, name });
  }, []);

  const handleRenameConfirm = useCallback(
    async (id, name) => {
      renameCV(id, name);
      setRenaming(null);
      refresh();
      if (user) {
        const updatedCVs = loadAllCVs() || {};
        const cv = updatedCVs[id];
        if (cv) await saveCV(user.id, cv);
      }
    },
    [refresh, user, saveCV]
  );

  const handleManualSync = useCallback(async () => {
    if (!user) return;
    await syncFromCloud(user.id);
    refresh();
    const merged = loadAllCVs() || {};
    await syncToCloud(user.id, merged);
    refresh();
  }, [user, syncFromCloud, syncToCloud, refresh]);

  const cvList = Object.values(cvs).sort(
    (a, b) => new Date(b.lastEdited) - new Date(a.lastEdited)
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#2563eb"/>
              <rect x="5" y="6" width="18" height="3" rx="1" fill="white" opacity="0.9"/>
              <rect x="5" y="11" width="14" height="2" rx="1" fill="white" opacity="0.7"/>
              <rect x="5" y="15" width="16" height="2" rx="1" fill="white" opacity="0.7"/>
              <rect x="5" y="19" width="10" height="2" rx="1" fill="white" opacity="0.5"/>
            </svg>
            <span className="dashboard-logo-text">Resume Builder</span>
          </div>

          <div className="dashboard-header-right">
            <AuthWidget
              user={user}
              isSyncing={isSyncing}
              lastSynced={lastSynced}
              onSignOut={signOut}
              onManualSync={handleManualSync}
            />
            <button className="dashboard-create-btn" onClick={handleCreateNew}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create New CV
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="dashboard-main">
        <div className="dashboard-title-row">
          <h1 className="dashboard-page-title">My CVs</h1>
          <span className="dashboard-cv-count">{cvList.length} {cvList.length === 1 ? 'CV' : 'CVs'}</span>
        </div>

        {cvList.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="4" width="40" height="52" rx="4" fill="#e2e8f0"/>
                <rect x="14" y="14" width="28" height="3" rx="1.5" fill="#94a3b8"/>
                <rect x="14" y="21" width="20" height="2" rx="1" fill="#cbd5e1"/>
                <rect x="14" y="27" width="24" height="2" rx="1" fill="#cbd5e1"/>
                <rect x="14" y="33" width="18" height="2" rx="1" fill="#cbd5e1"/>
                <circle cx="48" cy="48" r="12" fill="#2563eb"/>
                <line x1="48" y1="42" x2="48" y2="54" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="42" y1="48" x2="54" y2="48" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="dashboard-empty-title">No CVs yet</h2>
            <p className="dashboard-empty-desc">Create your first CV and start building your professional resume.</p>
            <button className="dashboard-empty-btn" onClick={handleCreateNew}>
              Create your first CV
            </button>
          </div>
        ) : (
          <div className="cv-grid">
            {cvList.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                onOpen={handleOpen}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onRenameStart={handleRenameStart}
              />
            ))}

            {/* "Add new" ghost card */}
            <button className="cv-card-new" onClick={handleCreateNew}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>New CV</span>
            </button>
          </div>
        )}
      </main>

      {/* Rename modal */}
      {renaming && (
        <RenameModal
          id={renaming.id}
          initialName={renaming.name}
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenaming(null)}
        />
      )}
    </div>
  );
}
