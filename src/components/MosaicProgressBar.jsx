import React, { useState, useEffect } from "react";
import "./MosaicProgressBar.css";

export default function MosaicProgressBar() {
  const [progress, setProgress] = useState(0); // progreso inicial simulado (ejemplo)

  // Simula actualización (conectar luego con los datos reales de la API)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : prev));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="mosaic-progress"
      aria-labelledby="mosaic-progress-title"
    >
      <div className="mosaic-progress-inner">
        <h3 id="mosaic-progress-title" className="mosaic-progress-title">
          PROGRESO DEL MOSAICO
        </h3>
        <p className="mosaic-progress-text">
          Ya hemos completado el <strong>{progress.toFixed(0)}%</strong> del
          gran mosaico de la Sagrada Família
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="mosaic-progress-subtext">
          Cada nueva foto nos acerca más a completar esta obra colectiva<p></p>
          ¡Gracias por tu aportación!
        </p>
      </div>
    </section>
  );
}
