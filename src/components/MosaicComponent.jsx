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

  const { normalizedTiles, baseWidth, baseHeight } = useMemo(() => {
    if (!tiles.length) {
      return { normalizedTiles: [], baseWidth: 0, baseHeight: 0 };
    }

    const toNumber = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const normalized = tiles
      .map((tile) => {
        const width =
          toNumber(tile?.width) ??
          toNumber(tile?.tileWidth) ??
          toNumber(tile?.w) ??
          null;
        const height =
          toNumber(tile?.height) ??
          toNumber(tile?.tileHeight) ??
          toNumber(tile?.h) ??
          null;
        const col = toNumber(tile?.col);
        const row = toNumber(tile?.row);
        const left =
          toNumber(tile?.left) ??
          toNumber(tile?.x) ??
          (col !== null && width !== null ? col * width : null);
        const top =
          toNumber(tile?.top) ??
          toNumber(tile?.y) ??
          (row !== null && height !== null ? row * height : null);
        return { ...tile, left, top, width, height };
      })
      .filter(
        (tile) =>
          Number.isFinite(tile.left) &&
          Number.isFinite(tile.top) &&
          Number.isFinite(tile.width) &&
          Number.isFinite(tile.height)
      );

    const width = normalized.reduce(
      (maxWidth, tile) => Math.max(maxWidth, tile.left + tile.width),
      0
    );
    const height = normalized.reduce(
      (maxHeight, tile) => Math.max(maxHeight, tile.top + tile.height),
      0
    );

    return {
      normalizedTiles: normalized,
      baseWidth: width,
      baseHeight: height,
    };
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
  if (!normalizedTiles.length || !baseWidth || !baseHeight) {
    return (
      <p className="mosaic-error">Tiles incompletos para mostrar el mosaico.</p>
    );
  }

  return (
    <div
      className="mosaic-grid"
      style={{
        aspectRatio: `${baseWidth} / ${baseHeight}`,
      }}
    >
      {normalizedTiles.map((tile) => {
        const color =
          Array.isArray(tile.color) && tile.color.length === 3
            ? tile.color
            : [128, 128, 128];
        const [r, g, b] = color;
        const left = (tile.left / baseWidth) * 100;
        const top = (tile.top / baseHeight) * 100;
        const width = (tile.width / baseWidth) * 100;
        const height = (tile.height / baseHeight) * 100;
        return (
          <div
            key={tile._id}
            className="mosaic-tile"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              backgroundColor: `rgb(${r}, ${g}, ${b})`,
            }}
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
