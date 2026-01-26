// src/components/MosaicComponent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./MosaicComponent.css";

export default function MosaicComponent() {
  const [searchParams] = useSearchParams();
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mosaicKey = searchParams.get("mosaicKey") || "default";

  const cols = useMemo(() => {
    if (!tiles.length) return 0;
    return (
      tiles.reduce((maxCol, tile) => {
        const col = Number.isFinite(tile?.col) ? tile.col : 0;
        return Math.max(maxCol, col);
      }, 0) + 1
    );
  }, [tiles]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(
          `${apiUrl}/mosaic/tiles?mosaicKey=${encodeURIComponent(mosaicKey)}`
        );
        if (!response.ok) {
          throw new Error("Error cargando mosaico");
        }
        const data = await response.json();
        if (isMounted) {
          setTiles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error cargando mosaico:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [mosaicKey]);

  if (loading) return <p className="mosaic-loading">Cargando mosaico...</p>;
  if (error)
    return <p className="mosaic-error">No se pudo cargar el mosaico.</p>;
  if (!tiles.length)
    return <p className="mosaic-error">No hay tiles para este mosaico.</p>;

  return (
    <div
      className="mosaic-grid"
      style={{
        gridTemplateColumns: cols
          ? `repeat(${cols}, minmax(0, 1fr))`
          : undefined,
      }}
    >
      {tiles.map((tile) => {
        const color = Array.isArray(tile.color) ? tile.color : [128, 128, 128];
        const [r, g, b] = color;
        return (
          <div
            key={tile._id}
            className="mosaic-tile"
            style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
          >
            {tile.matchedUrl ? (
              <img
                src={tile.matchedUrl}
                alt="foto colaborativa"
                loading="lazy"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
