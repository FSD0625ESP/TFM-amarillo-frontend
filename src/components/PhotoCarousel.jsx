// src/components/PhotoCarousel.jsx
import React, { useState, useEffect } from "react";

export default function PhotoCarousel({
  images = [],
  autoplay = false,
  interval = 5000,
}) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const total = images.length;

  // AUTOPLAY SIN HASH (NO SCROLL)
  useEffect(() => {
    if (!autoplay || total === 0) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, total, interval]);

  const goPrev = () => {
    setCurrent((current - 1 + total) % total);
  };

  const goNext = () => {
    setCurrent((current + 1) % total);
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative rounded-lg shadow-lg overflow-hidden">
      {/* Imagen */}
      <div className="relative w-full h-[500px] bg-black/5 flex items-center justify-center">
        <img
          src={images[current].src}
          alt={images[current].alt || `Imagen ${current + 1}`}
          className="w-full h-full object-contain"
        />

        {/* Flechas */}
        <button
          onClick={goPrev}
          className="btn btn-circle absolute left-5 top-1/2 -translate-y-1/2"
        >
          ❮
        </button>

        <button
          onClick={goNext}
          className="btn btn-circle absolute right-5 top-1/2 -translate-y-1/2"
        >
          ❯
        </button>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 py-4 bg-base-100">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`btn btn-xs ${i === current ? "btn-primary" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
