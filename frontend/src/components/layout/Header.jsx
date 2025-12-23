import { useEffect, useRef, useState } from 'react';

const icons = {
  person: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
    </svg>
  ),
  client: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v12H4z" />
      <path d="M8 7V5h8v2" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  ),
  project: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 17l4-4 3 3 5-6" />
      <circle cx="6" cy="6" r="2" />
      <circle cx="12" cy="10" r="2" />
      <circle cx="18" cy="7" r="2" />
    </svg>
  ),
  assignment: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 3v4M16 3v4M8 11h8M8 15h6" />
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  ),
  export: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v9" />
      <path d="M8 9l4-4 4 4" />
      <path d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h16" />
      <path d="M7 20V10" />
      <path d="M12 20V4" />
      <path d="M17 20v-6" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
};

function IconBadge({ type, label }) {
  return (
    <span className="icon-badge" aria-hidden="true">
      {icons[type]}
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export default function Header({ openModal, onImport, onExport, onToggleReports, showReports }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddAction = (modal) => {
    openModal(modal);
    setShowMenu(false);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-mark">
          <img src="/epsilon-logo.svg" alt="Epsilon PS" />
        </div>
        <div className="brand-copy">
          <h1>Resource Planner</h1>
          <p>Professional Services Team Management</p>
        </div>
      </div>

      <nav className="header-actions" ref={menuRef}>
        <ul className="header-nav" role="menubar">
          <li className="nav-item add-menu" role="none">
            <button
              type="button"
              className={`nav-link add-toggle ${showMenu ? 'open' : ''}`}
              onClick={() => setShowMenu(!showMenu)}
              aria-haspopup="true"
              aria-expanded={showMenu}
            >
              <IconBadge type="assignment" label="Add" />
              <span className="nav-label">Add</span>
              <span className="chevron" aria-hidden="true">▾</span>
            </button>

            {showMenu && (
              <div className="menu-dropdown" role="menu">
                <button type="button" role="menuitem" onClick={() => handleAddAction('person')}>
                  <IconBadge type="person" label="Add Team Member" />
                  <span className="menu-text">Add Team Member</span>
                </button>
                <button type="button" role="menuitem" onClick={() => handleAddAction('client')}>
                  <IconBadge type="client" label="Add Client" />
                  <span className="menu-text">Add Client</span>
                </button>
                <button type="button" role="menuitem" onClick={() => handleAddAction('project')}>
                  <IconBadge type="project" label="Add Project" />
                  <span className="menu-text">Add Project</span>
                </button>
                <button type="button" role="menuitem" onClick={() => handleAddAction('assignment')}>
                  <IconBadge type="assignment" label="Assign to Project" />
                  <span className="menu-text">Assign to Project</span>
                </button>
              </div>
            )}
          </li>

          <li className="nav-item" role="none">
            <button type="button" className="nav-link" onClick={onImport} role="menuitem">
              <IconBadge type="upload" label="Import" />
              <span className="nav-label">Import</span>
            </button>
          </li>

          <li className="nav-item" role="none">
            <button type="button" className="nav-link" onClick={onExport} role="menuitem">
              <IconBadge type="export" label="Export" />
              <span className="nav-label">Export</span>
            </button>
          </li>

          <li className="nav-item" role="none">
            <button
              type="button"
              className={`nav-link ${showReports ? 'active' : ''}`}
              onClick={onToggleReports}
              role="menuitem"
            >
              <IconBadge type={showReports ? 'back' : 'reports'} label={showReports ? 'Back to timeline' : 'Reports'} />
              <span className="nav-label">{showReports ? 'Timeline' : 'Reports'}</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
