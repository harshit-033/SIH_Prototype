import React from 'react';

export default function SecurityFlowDiagram() {
  const steps = [
    { title: 'React Frontend', desc: 'Prepares request & attaches Authorization: Bearer <token>' },
    { title: 'HTTP / Network', desc: 'Transmits JSON over localhost:8080 (CORS verified)' },
    { title: 'JwtAuthenticationFilter', desc: 'Extracts Bearer token from request Authorization header' },
    { title: 'JwtService', desc: 'Validates HMAC-SHA256 signature, expiry, and decodes claims' },
    { title: 'SecurityContext', desc: 'Sets authenticated principal with GrantedAuthorities (ROLE_*)' },
    { title: '@PreAuthorize RBAC', desc: 'Enforces method security (hasRole/hasAnyRole check)' },
    { title: 'Spring Controller', desc: 'Receives @Valid payload and maps response contracts' },
    { title: 'Domain Service', desc: 'Executes transactional business invariants & validations' },
    { title: 'JPA Repository', desc: 'Optimized queries with @EntityGraph to prevent N+1' },
    { title: 'PostgreSQL 18.4', desc: 'ACID storage engine with indexes & check constraints' }
  ];

  return (
    <section className="card security-flow-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">⚡</span>
          <h2 className="card-title">End-to-End Security & Request Architecture</h2>
        </div>
      </div>

      <div className="flow-container">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flow-step">
              <div className="step-num">{idx + 1}</div>
              <div className="step-content">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
            {idx < steps.length - 1 && <div className="flow-arrow">↓</div>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
