// Developed by aknex
import React from "react";

export default function SearchSection({
  searchState,
  setSearchState,
  onFindRides,
  onOpenCam,
  loading,
  error
}) {
  const { dir, dest, date, hour, minute, ampm, trolley, backpack, femaleOnly, verified } = searchState;

  const totalPts = trolley * 2 + backpack;

  const handleDirChange = (newDir) => {
    setSearchState(prev => ({ ...prev, dir: newDir }));
  };

  const handleLuggageChange = (type, delta) => {
    setSearchState(prev => {
      const current = prev[type];
      const updated = Math.max(0, Math.min(5, current + delta));
      return { ...prev, [type]: updated };
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <section id="sec-search" className="section-card">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Where are you heading?</h2>

      {/* Direction Toggle */}
      <div className="dir-tabs">
        <button 
          className={`dir-tab-btn ${dir === "out" ? "active" : ""}`}
          onClick={() => handleDirChange("out")}
          type="button"
        >
          <span>🏛️</span> From Campus
        </button>
        <button 
          className={`dir-tab-btn ${dir === "in" ? "active" : ""}`}
          onClick={() => handleDirChange("in")}
          type="button"
        >
          <span>🚕</span> To Campus
        </button>
      </div>

      {/* Route Visual */}
      <div className="route-visual">
        <span className="route-dot fill" />
        <span>{dir === "out" ? "CIT Campus" : dest}</span>
        <span className="route-line" />
        <span>→</span>
        <span className="route-line" />
        <span>{dir === "out" ? dest : "CIT Campus"}</span>
        <span className="route-dot" />
      </div>

      {/* Terminal Dropdown */}
      <label className="field-label" htmlFor="dest-select">
        {dir === "out" ? "Drop-off Terminal (from CIT)" : "Pickup Terminal (to CIT)"}
      </label>
      <select 
        id="dest-select"
        className="custom-select" 
        value={dest} 
        onChange={(e) => setSearchState(prev => ({ ...prev, dest: e.target.value }))}
      >
        <option value="Tambaram">Tambaram</option>
        <option value="Egmore">Egmore</option>
        <option value="Kilambakkam">Kilambakkam</option>
        <option value="Sriperumbudur">Sriperumbudur</option>
      </select>

      {/* Date & 12-Hour Time Picker */}
      <label className="field-label" htmlFor="trip-date">
        {dir === "out" ? "Leaving campus at" : "Arrive on there at (CIT Campus)"}
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input 
          id="trip-date"
          type="date" 
          className="custom-input"
          value={date}
          min={todayStr}
          onChange={(e) => setSearchState(prev => ({ ...prev, date: e.target.value }))}
        />

        <div className="time-picker-row">
          <select 
            className="time-select"
            value={hour}
            onChange={(e) => setSearchState(prev => ({ ...prev, hour: e.target.value }))}
          >
            {["01","02","03","04","05","06","07","08","09","10","11","12"].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span style={{ fontWeight: 800, color: "var(--muted)" }}>:</span>
          <select 
            className="time-select"
            value={minute}
            onChange={(e) => setSearchState(prev => ({ ...prev, minute: e.target.value }))}
          >
            {["00","15","30","45"].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="ampm-toggle-wrap">
            <button 
              type="button" 
              className={`ampm-btn ${ampm === "AM" ? "active" : ""}`}
              onClick={() => setSearchState(prev => ({ ...prev, ampm: "AM" }))}
            >
              AM
            </button>
            <button 
              type="button" 
              className={`ampm-btn ${ampm === "PM" ? "active" : ""}`}
              onClick={() => setSearchState(prev => ({ ...prev, ampm: "PM" }))}
            >
              PM
            </button>
          </div>
        </div>
      </div>

      {/* Luggage Knapsack Counters */}
      <label className="field-label">Luggage Details (Knapsack Allocation)</label>
      <div className="knapsack-grid">
        <div className="knapsack-card">
          <small style={{ color: "var(--muted)", fontWeight: 600 }}>Trolley bags (2 pts)</small>
          <div style={{ fontSize: 24, margin: "6px 0" }}>🧳</div>
          <div className="knapsack-controls">
            <button 
              type="button" 
              className="knapsack-btn"
              onClick={() => handleLuggageChange("trolley", -1)}
            >−</button>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{trolley}</span>
            <button 
              type="button" 
              className="knapsack-btn"
              onClick={() => handleLuggageChange("trolley", 1)}
            >+</button>
          </div>
        </div>

        <div className="knapsack-card">
          <small style={{ color: "var(--muted)", fontWeight: 600 }}>Backpacks (1 pt)</small>
          <div style={{ fontSize: 24, margin: "6px 0" }}>🎒</div>
          <div className="knapsack-controls">
            <button 
              type="button" 
              className="knapsack-btn"
              onClick={() => handleLuggageChange("backpack", -1)}
            >−</button>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{backpack}</span>
            <button 
              type="button" 
              className="knapsack-btn"
              onClick={() => handleLuggageChange("backpack", 1)}
            >+</button>
          </div>
        </div>
      </div>

      <div className="luggage-summary-badge">
        Your luggage: <b>{totalPts} {totalPts === 1 ? "point" : "points"}</b>
      </div>



      {error && (
        <div style={{ color: "var(--red)", fontSize: 13, fontWeight: 600, marginTop: 10, textAlign: "center" }}>
          {error}
        </div>
      )}

      <button 
        type="button"
        className="btn-primary" 
        style={{ marginTop: 18 }}
        onClick={onFindRides}
        disabled={loading}
      >
        {loading ? "Matching Cab Capacity…" : "Find Matching Cab"}
      </button>
    </section>
  );
}
