import React, { useState } from "react";
import "./LiveCamera.css";

export default function LiveCamera() {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => setIsExpanded(true);
  const handleClose = () => setIsExpanded(false);

  return (
    <div className={`livecam-container ${isExpanded ? "expanded" : ""}`}>
      {/* Iframe del vídeo en directo */}
      <iframe
        src="https://webcams.windy.com/webcams/public/embed/player/1448811166/day"
        title="Barcelona: Sagrada Família - Live Camera"
        allow="autoplay; fullscreen"
        frameBorder="0"
        loading="lazy"
        className="livecam-iframe"
      ></iframe>

      {/* Botón para abrir/cerrar */}
      {!isExpanded ? (
        <button
          className="livecam-expand-btn"
          onClick={handleExpand}
          aria-label="Ampliar cámara"
        >
          ⛶
        </button>
      ) : (
        <button
          className="livecam-close-btn"
          onClick={handleClose}
          aria-label="Cerrar cámara"
        >
          ✕
        </button>
      )}
    </div>
  );
}
