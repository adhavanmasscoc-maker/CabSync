import React from "react";

export default function VoteModal({
  isOpen,
  onClose,
  lobby,
  onVotePassenger
}) {
  if (!isOpen || !lobby) return null;

  const pax = lobby.pax || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Ride Moderation</h2>
          <button 
            type="button"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--track)", border: "none", cursor: "pointer", fontSize: 16 }}
          >✕</button>
        </div>

        {/* Lock Banner */}
        <div style={{ background: "var(--green-soft)", color: "var(--green)", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span>🔓</span>
          <span>Voting Open (Locked &lt;45m before departure)</span>
        </div>

        <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.4, marginBottom: 14 }}>
          Requires a majority vote (2 votes in a 4-person cab) to remove an unresponsive or disruptive passenger. Luggage points are released immediately upon removal.
        </p>

        {/* Passenger List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pax.map((p, idx) => (
            <div 
              key={p.uid || p.name || idx}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 12 }}
            >
              <div>
                <b style={{ fontSize: 14 }}>{p.name}{p.me ? " (You)" : ""}</b>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {p.dept} · {p.pts} luggage pt{p.pts > 1 ? "s" : ""} · {p.votes || 0} vote{(p.votes || 0) === 1 ? "" : "s"}
                </div>
              </div>

              {!p.me && (
                <button
                  type="button"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1.5px solid var(--red)",
                    background: p.hasMyVote ? "var(--red)" : "var(--red-soft)",
                    color: p.hasMyVote ? "#fff" : "var(--red)",
                    cursor: "pointer"
                  }}
                  onClick={() => onVotePassenger(p.uid || p.name)}
                >
                  {p.hasMyVote ? "Voted ✕" : "Vote to Remove"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
