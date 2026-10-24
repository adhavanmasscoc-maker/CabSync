import React from "react";

export default function LoginSection({ 
  user, 
  onSignIn, 
  onSignOut, 
  onContinueToSearch, 
  error, 
  loading 
}) {
  return (
    <section id="sec-login" className="section-card">
      <div className="hero-section">
        <h1 className="hero-title">
          <span style={{ color: "#4285F4" }}>C</span>
          <span style={{ color: "#EA4335" }}>I</span>
          <span style={{ color: "#FBBC04" }}>T</span>
          <span style={{ color: "#34A853", marginLeft: 4 }}>Cab</span>Sync
        </h1>
        <p className="hero-desc">
          Privacy-first, luggage-aware campus rides to Tambaram, Egmore, and Kilambakkam.
        </p>

        <div className="perks-list">
          <div className="perk-item">
            <span className="perk-icon" style={{ background: "var(--blue-soft)" }}>🧳</span>
            <span>Bags counted, so everyone fits</span>
          </div>
          <div className="perk-item">
            <span className="perk-icon" style={{ background: "var(--green-soft)" }}>🔒</span>
            <span>No phone numbers shared</span>
          </div>
          <div className="perk-item">
            <span className="perk-icon" style={{ background: "var(--yellow-soft)" }}>💸</span>
            <span>Split the fare in one tap</span>
          </div>
        </div>
      </div>

      {/* 3. Hero Button Transformation */}
      {user ? (
        <div className="verified-student-pill">
          <div className="verified-header">
            <div className="verified-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <b style={{ fontSize: 15, color: "var(--ink)" }}>Verified CIT Student</b>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {user.name} ({user.dept} · {user.yr} Year)
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            Signed in as <b>{user.email}</b>
          </div>

          <button 
            className="btn-primary" 
            style={{ marginTop: 6 }}
            onClick={onContinueToSearch}
          >
            Continue to Ride Search →
          </button>

          <button 
            className="switch-account-link" 
            onClick={onSignOut}
          >
            Switch Account
          </button>
        </div>
      ) : (
        <div>
          <button 
            id="googleSignInBtn"
            className="btn-google" 
            onClick={onSignIn}
            disabled={loading}
          >
            {loading ? (
              <span>Connecting to Google…</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/>
                  <path fill="#FBBC04" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
                </svg>
                <span>Sign in with Google (@citchennai.net)</span>
              </>
            )}
          </button>

          {error && (
            <div style={{ color: "var(--red)", fontSize: 13, fontWeight: 600, marginTop: 10, textAlign: "center" }}>
              {error}
            </div>
          )}

          <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
            Restricted to CIT institutional accounts only.<br />
            Non-college emails will be blocked automatically.
          </p>
        </div>
      )}
    </section>
  );
}
