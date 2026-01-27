// src/components/MosaicComponent.jsx
import React, { useEffect, useState } from "react";
import "./MosaicComponent.css";

export default function MosaicComponent() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // useEffect(() => {
  //   async function load() {
  //     try {
  //       const data = await getAllPhotos();
  //       setPhotos(data || []);
  //     } catch (err) {
  //       console.error("Error cargando mosaico:", err);
  //       setError(true);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   load();
  // }, []);

  if (loading) return <p className="mosaic-loading">Cargando mosaico...</p>;
  if (error)
    return <p className="mosaic-error">No se pudo cargar el mosaico.</p>;

  return (
    <div className="mosaic-grid">
      {photos.map((photo) => (
        <div key={photo.id} className="mosaic-tile">
          <img
            src={photo.imageUrl}
            alt={photo.alt || "foto colaborativa"}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
