import React from 'react'

function Header({ user, isAdmin, currentPage, onNavigate, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => onNavigate('home')}>
          🚀 AI Launch Board
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <a onClick={() => onNavigate('home')}>Home</a>
            </li>
            <li>
              <a onClick={() => onNavigate('pricing')}>Pricing</a>
            </li>
            {user && (
              <li>
                <a onClick={() => onNavigate('submit')}>Submit Product</a>
              </li>
            )}
            {isAdmin && (
              <li>
                <a onClick={() => onNavigate('admin')}>Admin</a>
              </li>
            )}
          </ul>
        </nav>

        <div className="user-section">
          {user ? (
            <>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
              <button
                className="btn btn-secondary btn-small"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-small"
              onClick={() => onNavigate('auth')}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
