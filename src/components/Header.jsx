// Developed by aknex
import React, { useRef, useEffect, useState } from "react";

export default function Header({ 
  activeTab, 
  setActiveTab, 
  user, 
  onSignOut 
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const trackRef = useRef(null);
  const tabRefs = useRef({});

  // Smooth sliding pill indicator geometry calculation
  useEffect(() => {
    const currentTabEl = tabRefs.current[activeTab];
    if (currentTabEl && trackRef.current) {
      const trackRect = trackRef.current.getBoundingClientRect();
      const tabRect = currentTabEl.getBoundingClientRect();
      setIndicatorStyle({
        transform: `translateX(${tabRect.left - trackRect.left - 3}px)`,
        width: `${tabRect.width}px`
      });
    }
  }, [activeTab, user]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="app-header">
      {/* 1. Minimal, Clean Top-Left App Logo & Title */}
      <div className="brand-lockup" onClick={scrollToTop} role="button" tabIndex={0} aria-label="CIT CabSync home">
        <span className="logo-bracket-btn" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            {/* Google Blue < */}
            <path d="M9.5 7.5L3.5 14L9.5 20.5" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Google Red & Yellow / */}
            <path d="M12 21.5L16 6.5" stroke="#EA4335" strokeWidth="2.8" strokeLinecap="round"/>
            {/* Google Green > */}
            <path d="M18.5 7.5L24.5 14L18.5 20.5" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="brand-title">CIT CabSync</span>
      </div>

      {/* 2. Animated Top Navigation Pill Bar */}
      <nav className="nav-pill-track" ref={trackRef} aria-label="Primary Navigation">
        {/* Sliding Active Pill Indicator */}
        <div 
          className="nav-pill-indicator" 
          style={indicatorStyle}
        />

        {/* Tab 1: Login or Morphed Avatar */}
        <button
          ref={el => tabRefs.current["login"] = el}
          className={`nav-tab-btn ${activeTab === "login" ? "active" : ""}`}
          onClick={() => {
            if (user) {
              setProfileOpen(prev => !prev);
            } else {
              setActiveTab("login");
            }
          }}
          aria-label={user ? "Profile details" : "Login tab"}
        >
          {user ? (
            /* 3. Post-Login Morph: Circular Avatar + Verified Check Icon + Emerald Pulse */
            <div className="morphed-avatar-pill" title={user.email}>
              <span>{user.name ? user.name[0].toUpperCase() : "U"}</span>
              <span className="morphed-check-badge">
                <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4.5 7.5L8.5 2.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Login</span>
            </>
          )}
        </button>

        {/* Tab 2: Search */}
        <button
          ref={el => tabRefs.current["search"] = el}
          className={`nav-tab-btn ${activeTab === "search" ? "active" : ""}`}
          onClick={() => {
            setProfileOpen(false);
            setActiveTab("search");
          }}
          aria-label="Search tab"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </button>

        {/* Tab 3: Lobby */}
        <button
          ref={el => tabRefs.current["lobby"] = el}
          className={`nav-tab-btn ${activeTab === "lobby" ? "active" : ""}`}
          onClick={() => {
            setProfileOpen(false);
            setActiveTab("lobby");
          }}
          aria-label="Lobby tab"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 11 2 11.4V16c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          <span>Lobby</span>
        </button>
      </nav>

      {/* Tooltip / Popover on tap of Morphed Icon */}
      {profileOpen && user && (
        <div className="profile-popover" role="dialog" aria-label="Student Profile">
          <div className="popover-header">
            <div className="morphed-avatar-pill" style={{ width: 36, height: 36, fontSize: 16 }}>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <b style={{ fontSize: 14.5, display: "block" }}>{user.name}</b>
              <span className="popover-badge">✓ Verified CIT Student</span>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "4px 0" }}>
            <b>Email:</b> {user.email}
          </p>
          <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
            <b>Batch:</b> {user.dept} · Batch {user.batch} ({user.yr} Year)
          </p>
          <button 
            className="popover-btn" 
            onClick={() => {
              setProfileOpen(false);
              onSignOut();
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
