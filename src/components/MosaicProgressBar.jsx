import React, { useMemo } from "react";
import "./MosaicProgressBar.css";

const TOTAL_PHOTOS_GOAL = 1000;

export default function MosaicProgressBar({ totalPhotos = 0 }) {
  const progress = useMemo(() => {
    const pct = (totalPhotos / TOTAL_PHOTOS_GOAL) * 100;
    return Math.min(pct, 100);
  }, [totalPhotos]);


  return (
    <section className="mosaic-progress">
      <div className="mosaic-progress-inner">
        <h3 className="mosaic-progress-title">PROGRESO DEL MOSAICO</h3>

        <p className="mosaic-progress-text">
          Ya hemos completado el{" "}
          <strong>{progress.toFixed(1)}%</strong> del gran mosaico de la
          Sagrada Família
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mosaic-progress-subtext">
          <strong>{totalPhotos}</strong> fotos aportadas de{" "}
          <strong>{TOTAL_PHOTOS_GOAL}</strong> necesarias.
          <br />
          ¡Gracias por tu aportación!
        </p>
      </div>
    </section>
  );
}
