// src/components/PhotoCarousel.jsx
import React, { useState, useEffect } from "react";
import "./PhotoCarousel.css";

export default function PhotoCarousel({ images = [] }) {
  const [current, setCurrent] = useState(0);

  // Avanzar automáticamente cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <section className="carousel" aria-label="Carrusel de imágenes destacadas">
      <div className="carousel-inner">
        {images.map((img, index) => (
          <div
            key={index}
            className={`carousel-item ${index === current ? "active" : ""}`}
          >
            <img src={img.src} alt={img.alt} loading="lazy" />
            <div className="carousel-caption">
              <h3>{img.title}</h3>
              <p>{img.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controles */}
      <button
        className="carousel-btn prev"
        onClick={() =>
          setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        }
        aria-label="Anterior"
      >
        ‹
      </button>

      <button
        className="carousel-btn next"
        onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
        aria-label="Siguiente"
      >
        ›
      </button>
    </section>
  );
}
