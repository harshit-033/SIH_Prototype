import React from 'react';

const SQL_STATEMENTS = `-- 1. Admin User (Password: Password@123)
INSERT INTO users (email, password, role, status, created_at, updated_at)
VALUES ('admin@sih.gov.in', '$2a$10$qmL..r1aJqcExsGv5omz.OoTXxI9pdh64M1I5y9jXTkCl5PYsDpdG', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Inspector User (Password: Password@123)
INSERT INTO users (email, password, role, status, created_at, updated_at)
VALUES ('inspector@sih.gov.in', '$2a$10$qmL..r1aJqcExsGv5omz.OoTXxI9pdh64M1I5y9jXTkCl5PYsDpdG', 'INSPECTOR', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Institute User (Password: Password@123)
INSERT INTO users (email, password, role, status, created_at, updated_at)
VALUES ('institute@sih.gov.in', '$2a$10$qmL..r1aJqcExsGv5omz.OoTXxI9pdh64M1I5y9jXTkCl5PYsDpdG', 'INSTITUTE', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 4. Disabled User (For testing 403 Forbidden rejection)
INSERT INTO users (email, password, role, status, created_at, updated_at)
VALUES ('disabled@sih.gov.in', '$2a$10$qmL..r1aJqcExsGv5omz.OoTXxI9pdh64M1I5y9jXTkCl5PYsDpdG', 'INSTITUTE', 'DISABLED', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;`;

export default function SqlReference({ onCopySql }) {
  return (
    <section className="card sql-reference-card">
      <div className="section-header">
        <div>
          <h3 className="section-title">🗄️ PostgreSQL Database Seed Commands</h3>
          <p className="section-desc">
            Run these SQL statements directly in PostgreSQL (port <code>5433</code> / database <code>sih_inspection</code>).
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onCopySql(SQL_STATEMENTS)}
        >
          📋 Copy All SQL
        </button>
      </div>

      <div className="sql-code-wrapper">
        <pre className="sql-code">{SQL_STATEMENTS}</pre>
      </div>
    </section>
  );
}
