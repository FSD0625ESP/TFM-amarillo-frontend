import React from "react";

export default function ProgressBar({ progress }) {
  return (
    <div className="progress-container">
      <p>Progreso del Mosaico</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
