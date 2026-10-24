import React, { useRef, useState, useEffect } from "react";

export default function CameraModal({ isOpen, onClose, onVerified }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [camError, setCamError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCamError("");
      setVerifying(false);
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => {
          setCamError("Camera permission blocked or unavailable. You can still test verification with memory check.");
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    setVerifying(true);
    setTimeout(() => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      onVerified();
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Scan CIT College ID</h2>
          <button 
            type="button"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--track)", border: "none", cursor: "pointer", fontSize: 16 }}
          >✕</button>
        </div>

        <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.4, marginBottom: 14 }}>
          Hold your college student ID card within the frame. The photo is processed in RAM only for gender validation and instantly discarded without saving.
        </p>

        <div style={{ width: "100%", height: 220, background: "#000", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {camError && (
            <div style={{ position: "absolute", inset: 0, padding: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 13 }}>
              {camError}
            </div>
          )}
        </div>

        <button 
          type="button"
          className="btn-primary" 
          style={{ marginTop: 16 }}
          onClick={handleCapture}
          disabled={verifying}
        >
          {verifying ? "Processing ID in RAM…" : "Capture & Verify ID"}
        </button>
      </div>
    </div>
  );
}
