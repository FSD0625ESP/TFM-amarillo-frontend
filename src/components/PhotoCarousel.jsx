// src/components/PhotoCarousel.jsx
import React from "react";

export default function PhotoCarousel({ images = [] }) {
  if (images.length === 0) return null;

  return (
    <div className="w-full">
      {/* Carrusel DaisyUI */}
      <div className="carousel w-full rounded-lg overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            id={`item${index + 1}`}
            className="carousel-item w-full"
          >
            <img
              src={img.src}
              alt={img.alt || `Imagen ${index + 1}`}
              className="w-full object-cover max-h-[500px]"
            />
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-center w-full py-2 gap-2">
        {images.map((_, index) => (
          <a
            key={index}
            href={`#item${index + 1}`}
            className="btn btn-xs"
          >
            {index + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
