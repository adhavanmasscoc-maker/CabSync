// Developed by aknex
import React, { useState } from "react";

export default function ChatPayModal({
  isOpen,
  onClose,
  lobby,
  messages = [],
  onSendMessage,
  qrCodeUrl,
  onUploadQr
}) {
  const [fare, setFare] = useState(600);
  const [inputText, setInputText] = useState("");

  if (!isOpen || !lobby) return null;

  const paxCount = Math.max(1, (lobby.pax || []).length);
  const perPerson = Math.round(fare / paxCount);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Trip Chat &amp; Payment</h2>
          <button 
            type="button"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--track)", border: "none", cursor: "pointer", fontSize: 16 }}
          >✕</button>
        </div>

        {/* Pinned QR Box */}
        <div style={{ border: "2px dashed var(--line)", borderRadius: 14, padding: 14, textAlign: "center", marginBottom: 14 }}>
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="Trip Leader GPay QR" 
              style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, margin: "0 auto" }} 
            />
          ) : (
            <div>
              <div style={{ fontSize: 24, marginBottom: 4 }}>📌</div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                Pinned: Trip Leader's GPay QR
              </p>
              <label style={{ display: "inline-block", background: "var(--blue-soft)", color: "var(--blue)", fontWeight: 700, fontSize: 13, padding: "6px 14px", borderRadius: "9999px", cursor: "pointer" }}>
                Upload QR
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }}
                  onChange={onUploadQr} 
                />
              </label>
            </div>
          )}
        </div>

        {/* Fare Splitter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--track)", padding: "10px 14px", borderRadius: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
            <span>Total fare ₹</span>
            <input 
              type="number" 
              value={fare} 
              onChange={e => setFare(Number(e.target.value) || 0)}
              style={{ width: 75, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)", font: "inherit", fontWeight: 700 }}
            />
          </div>
          <b style={{ color: "var(--green)", fontSize: 17 }}>₹{perPerson} each</b>
        </div>

        {/* Live Chat */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
            Group Chat (Auto-deletes 1 hour post-trip)
          </div>

          <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {messages.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "10px 0" }}>
                No messages yet. Say hi or coordinate pickup point!
              </p>
            ) : (
              messages.map((m, idx) => (
                <div 
                  key={idx} 
                  style={{
                    alignSelf: m.me ? "flex-end" : "flex-start",
                    background: m.me ? "var(--blue)" : "var(--track)",
                    color: m.me ? "#fff" : "var(--ink)",
                    padding: "8px 12px",
                    borderRadius: 14,
                    maxWidth: "80%",
                    fontSize: 13.5
                  }}
                >
                  <small style={{ display: "block", fontSize: 10.5, opacity: 0.75, fontWeight: 700 }}>
                    {m.senderName || "Rider"}
                  </small>
                  {m.text}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
            <input 
              type="text" 
              placeholder="Type message…" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="custom-input"
              style={{ minHeight: 42, fontSize: 14 }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 44, minHeight: 42, padding: 0, borderRadius: "50%", flexShrink: 0 }}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
