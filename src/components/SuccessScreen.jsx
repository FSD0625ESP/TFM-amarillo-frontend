import React from "react";
import "./SuccessScreen.css";
import { Link } from "react-router-dom";

export default function SuccessScreen({ colaboradorNum }) {
  return (
    <div className="success-container">
      <div className="success-card">
        <h2>🎉 ¡Felicidades! 🎉</h2>
        <p>
          Eres el colaborador <strong>#{colaboradorNum}</strong> del mosaico
          colaborativo de la Sagrada Família.
        </p>

        <p className="success-subtext">
          Gracias por formar parte de este homenaje colectivo. Tu imagen ya está
          contribuyendo a construir la historia visual de este monumento único.
        </p>

        <div className="success-actions">
          <button
            className="btn-share"
            onClick={() =>
              navigator.share
                ? navigator.share({
                    title: "Colaboré con el mosaico de la Sagrada Família",
                    text: "¡Acabo de subir mi foto al mosaico colaborativo de la Sagrada Família 2026!",
                    url: window.location.origin,
                  })
                : alert(
                    "La función de compartir no está disponible en este navegador."
                  )
            }
          >
            📸 Compartir en redes
          </button>

          <Link to="/mosaic" className="btn-link">
            🖼️ Ver el mosaico
          </Link>

          <Link to="/" className="btn-outline">
            🧩 Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
