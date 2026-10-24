// Developed by aknex
import React, { useState } from "react";

const COLORS = ["#1A73E8", "#EA4335", "#FBBC04", "#34A853"];

function UserAvatar({ name, index = 0, size = 56 }) {
  const c = COLORS[index % 4];
  const hair = ["#3C4043", "#8D5524", "#202124", "#B06000"][index % 4];
  const skin = ["#F1C27D", "#C68642", "#E0AC69", "#8D5524"][(index + 1) % 4];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={name} style={{ borderRadius: "50%", margin: "0 auto 8px", display: "block" }}>
      <circle cx="32" cy="32" r="32" fill={c} opacity=".15"/>
      <path d="M10 64c0-13 10-20 22-20s22 7 22 20z" fill={c}/>
      <circle cx="32" cy="27" r="12" fill={skin}/>
      <path d="M20 26c0-9 6-14 12-14s12 5 12 14c-3-5-7-7-12-7s-9 2-12 7z" fill={hair}/>
      <circle cx="28" cy="28" r="1.4" fill="#202124"/><circle cx="36" cy="28" r="1.4" fill="#202124"/>
      <path d="M28 33q4 3 8 0" stroke="#202124" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export default function LobbySection({
  lobby,
  onOpenChat,
  onOpenVote,
  onLeaveLobby,
  allRides = [],
  onJoinRide,
  myLuggagePts = 1
}) {
  const [filter, setFilter] = useState("all");

  // Filter rides based on direction
  const filteredRides = allRides.filter(r => {
    if (filter === "out") return r.direction === "out" || r.dir === "out";
    if (filter === "in") return r.direction === "in" || r.dir === "in";
    return true;
  });

  return (
    <section id="sec-lobby">
      {/* 1. YOUR ACTIVE CAB POOL (if user has joined one) */}
      {lobby && (
        <div className="section-card">
          <div className="lobby-header-bar">
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase" }}>
                Your Active Cab Pool
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>
                {lobby.dir === "out" ? `CIT Campus → ${lobby.dest}` : `${lobby.dest} → CIT Campus`}
              </h2>
            </div>
            <span style={{ background: "var(--green-soft)", color: "var(--green)", fontWeight: 700, fontSize: 12, padding: "4px 10px", borderRadius: "9999px" }}>
              Active
            </span>
          </div>

          <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
            <span>🗓️ {lobby.date || "Today"}</span>
            <span>⏰ {lobby.dir === "out" ? `Leaving ${lobby.time}` : `Arriving ${lobby.time}`}</span>
          </div>

          {/* Capacity Progress Bar */}
          {(() => {
            const usedPts = (lobby.pax || []).reduce((sum, p) => sum + (p.pts || 0), 0);
            const maxPts = lobby.car?.max || 7;
            const pct = Math.min(100, Math.round((usedPts / maxPts) * 100));
            const barColor = pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--blue)";
            return (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                  <span>{usedPts}/{maxPts} Luggage Points Filled</span>
                  <span style={{ color: barColor }}>{maxPts - usedPts <= 0 ? "Cab Full" : `${maxPts - usedPts} pts left`}</span>
                </div>
                <div className="capacity-track">
                  <div className="capacity-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })()}

          {/* 4-Passenger Grid */}
          <div className="pax-grid">
            {[0, 1, 2, 3].map((slotIdx) => {
              const p = (lobby.pax || [])[slotIdx];
              if (p) {
                return (
                  <div key={p.uid || p.name || slotIdx} className="pax-card">
                    <UserAvatar name={p.name} index={slotIdx} />
                    <b style={{ fontSize: 14.5, display: "block" }}>{p.name}{p.me ? " (You)" : ""}</b>
                    <small style={{ color: "var(--muted)", fontSize: 12 }}>{p.dept} · {p.yr ? `${p.yr} Year` : "Student"}</small>
                    <div style={{ marginTop: 6 }}>
                      <span style={{ background: "var(--blue-soft)", color: "var(--blue)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
                        {p.pts} {p.pts === 1 ? "pt" : "pts"}
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={`empty-${slotIdx}`} className="pax-card empty">
                  <span style={{ fontSize: 26, color: "var(--line)", marginBottom: 4 }}>+</span>
                  <span style={{ fontSize: 12 }}>Waiting for rider</span>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
            <button 
              type="button" 
              className="btn-google"
              style={{ minHeight: 46, fontSize: 13.5 }}
              onClick={onOpenChat}
            >
              <span>💬</span> Chat &amp; QR
            </button>

            <button 
              type="button" 
              className="btn-google"
              style={{ minHeight: 46, fontSize: 13.5 }}
              onClick={onOpenVote}
            >
              <span>⚖️</span> Vote Out
            </button>
          </div>

          <button 
            type="button"
            style={{ width: "100%", marginTop: 12, padding: "8px", color: "var(--muted)", background: "none", border: "none", fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}
            onClick={onLeaveLobby}
          >
            Leave this cab pool
          </button>
        </div>
      )}

      {/* 2. ALL CURRENT OTHERS' TRAVEL OPTIONS */}
      <div className="section-card" style={{ marginTop: lobby ? 16 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800 }}>
              {lobby ? "Other Students' Travel Options" : "Current Student Travel Options"}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
              {filteredRides.length} active cab {filteredRides.length === 1 ? "pool" : "pools"} organized by CIT students
            </p>
          </div>
          <span style={{ fontSize: 22 }}>🚕</span>
        </div>

        {/* Direction Filter Chips */}
        <div className="ride-filter-chips">
          <button 
            type="button" 
            className={`ride-filter-chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Rides ({allRides.length})
          </button>
          <button 
            type="button" 
            className={`ride-filter-chip ${filter === "out" ? "active" : ""}`}
            onClick={() => setFilter("out")}
          >
            🏛️ From Campus
          </button>
          <button 
            type="button" 
            className={`ride-filter-chip ${filter === "in" ? "active" : ""}`}
            onClick={() => setFilter("in")}
          >
            🚕 To Campus
          </button>
        </div>

        {/* List of Travel Options */}
        {filteredRides.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 14px", color: "var(--muted)", fontSize: 14 }}>
            <p>No active student rides match this filter right now.</p>
            <p style={{ fontSize: 12.5, marginTop: 4 }}>Use Search to create the first cab pool for this route!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredRides.map((ride) => {
              const isCurrentLobby = lobby && (lobby.rideId === ride.id || lobby.rideId === ride.rideId);
              const isOut = (ride.direction || ride.dir) === "out";
              const dest = ride.destination || ride.dest || "Tambaram";
              const paxList = ride.pax || [];
              const paxCount = ride.currentPassengers || paxList.length || 1;
              const maxPassengers = ride.maxPassengers || 4;
              const currentLuggage = ride.currentLuggageUnits || paxList.reduce((s, p) => s + (p.pts || 0), 0) || 0;
              const maxLuggage = ride.maxLuggageUnits || 7;
              const isFull = paxCount >= maxPassengers || currentLuggage + myLuggagePts > maxLuggage;

              return (
                <div key={ride.id || ride.rideId} className="ride-option-card">
                  <div className="ride-option-header">
                    <div>
                      <b style={{ fontSize: 15, display: "block", color: "var(--ink)" }}>
                        {isOut ? `CIT Campus → ${dest}` : `${dest} → CIT Campus`}
                      </b>
                      <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                        ⏰ {isOut ? "Leaves" : "Arrives"} {ride.departureTime || ride.time || "4:00 PM"} · {ride.departureDate || ride.date || "Today"}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: "9999px", background: "var(--blue-soft)", color: "var(--blue)" }}>
                        {ride.vehicleType || "Prime Sedan"}
                      </span>
                    </div>
                  </div>

                  {/* Rider avatars & capacity statistics */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="rider-avatar-stack">
                        {paxList.slice(0, 4).map((p, pIdx) => (
                          <div key={p.uid || p.name || pIdx} className="rider-avatar-mini" title={p.name}>
                            {p.name ? p.name[0].toUpperCase() : "U"}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        <b>{paxCount}/{maxPassengers}</b> riders · <b>{currentLuggage}/{maxLuggage}</b> luggage pts
                      </span>
                    </div>

                    {isCurrentLobby ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
                        ✓ Joined
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{
                          width: "auto",
                          minHeight: 34,
                          padding: "0 14px",
                          fontSize: 12.5,
                          background: isFull ? "#9AA0A6" : "var(--blue)",
                          boxShadow: "none"
                        }}
                        disabled={isFull}
                        onClick={() => onJoinRide(ride)}
                      >
                        {isFull ? "Full" : "Join Pool"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
