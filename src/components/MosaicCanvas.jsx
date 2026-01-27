import React, { useEffect, useRef, useState } from "react";

const CACHE_PREFIX = "tfm_mosaic_cache";

export default function MosaicCanvas({
  apiUrl,
  mosaicKey = "default",
  pollIntervalMs = 30000,
  onTilesReady,
}) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fallbackImage, setFallbackImage] = useState("");
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  const refreshInFlight = useRef(false);
  const hasCacheRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const cacheKey = `${CACHE_PREFIX}:${mosaicKey}`;

    const toNumber = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const readCache = () => {
      if (typeof window === "undefined") return null;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const tiles = Array.isArray(parsed?.tiles) ? parsed.tiles : [];
        const validTiles = tiles.filter(
          (tile) =>
            Number.isFinite(tile?.left) &&
            Number.isFinite(tile?.top) &&
            Number.isFinite(tile?.width) &&
            Number.isFinite(tile?.height)
        );
        if (validTiles.length === 0) return null;
        return {
          tiles: validTiles,
          mainImageUrl: parsed?.mainImageUrl || "",
        };
      } catch (err) {
        return null;
      }
    };

    const writeCache = ({ tiles, mainImageUrl }) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            tiles,
            mainImageUrl,
            updatedAt: Date.now(),
          })
        );
      } catch (err) {
        // Ignore cache write errors (storage full, etc.)
      }
    };

    const fetchMosaicConfig = async () => {
      try {
        const res = await fetch(`${apiUrl}/mosaic/config`, {
          cache: "no-store",
        });
        if (!res.ok) {
          return { mainImageUrl: "", tileWidth: null, tileHeight: null };
        }
        const data = await res.json();
        const parsedTileWidth = toNumber(data?.tileWidth);
        const parsedTileHeight = toNumber(data?.tileHeight);
        return {
          mainImageUrl: data?.mainImageUrl || "",
          tileWidth: parsedTileWidth,
          tileHeight: parsedTileHeight,
        };
      } catch (err) {
        return { mainImageUrl: "", tileWidth: null, tileHeight: null };
      }
    };

    const loadImage = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

    const normalizeTile = (tile, config) => {
      const width =
        toNumber(tile?.width) ||
        toNumber(tile?.tileWidth) ||
        toNumber(config?.tileWidth) ||
        toNumber(tile?.w) ||
        null;
      const height =
        toNumber(tile?.height) ||
        toNumber(tile?.tileHeight) ||
        toNumber(config?.tileHeight) ||
        toNumber(tile?.h) ||
        null;
      const left =
        toNumber(tile?.left) ??
        toNumber(tile?.x) ??
        (toNumber(tile?.col) !== null && width !== null
          ? toNumber(tile?.col) * width
          : null);
      const top =
        toNumber(tile?.top) ??
        toNumber(tile?.y) ??
        (toNumber(tile?.row) !== null && height !== null
          ? toNumber(tile?.row) * height
          : null);
      return { ...tile, left, top, width, height };
    };

    const renderTiles = async ({ tiles, mainImageUrl, updateCache }) => {
      if (cancelled) return;
      if (!Array.isArray(tiles) || tiles.length === 0) return;

      const baseWidth = tiles.reduce(
        (maxWidth, tile) => Math.max(maxWidth, tile.left + tile.width),
        0
      );
      const baseHeight = tiles.reduce(
        (maxHeight, tile) => Math.max(maxHeight, tile.top + tile.height),
        0
      );
      if (!baseWidth || !baseHeight) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = baseWidth;
      canvas.height = baseHeight;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      const hasMatched = tiles.some((tile) => tile.matchedUrl);
      if (!hasMatched && mainImageUrl) {
        try {
          const mainImage = await loadImage(mainImageUrl);
          ctx.drawImage(mainImage, 0, 0, baseWidth, baseHeight);
        } catch (err) {
          // If main image fails, fall back to color tiles below.
        }
      }

      const imageCache = new Map();

      const drawTile = (tile, image) => {
        if (cancelled) return;
        const { left, top, width, height } = tile;
        if (image) {
          ctx.drawImage(image, left, top, width, height);
          return;
        }
        const color = Array.isArray(tile.color) ? tile.color : [128, 128, 128];
        const [r, g, b] = color;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(left, top, width, height);
      };

      if (!hasMatched) {
        tiles.forEach((tile) => {
          drawTile(tile, null);
        });
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 1;
        tiles.forEach((tile) => {
          ctx.strokeRect(tile.left, tile.top, tile.width, tile.height);
        });
      } else {
        tiles.forEach((tile) => {
          if (!tile.matchedUrl) {
            drawTile(tile, null);
            return;
          }

          const url = tile.matchedUrl;
          let img = imageCache.get(url);
          if (!img) {
            img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            imageCache.set(url, img);
          }

          if (img.complete && img.naturalWidth > 0) {
            drawTile(tile, img);
            return;
          }

          img.addEventListener("load", () => drawTile(tile, img), {
            once: true,
          });
          img.addEventListener("error", () => drawTile(tile, null), {
            once: true,
          });
        });
      }

      if (!cancelled) {
        hasCacheRef.current = true;
        setFallbackImage("");
        setError("");
        setLoading(false);
        if (typeof onTilesReady === "function") {
          onTilesReady(tiles);
        }
      }

      if (updateCache) {
        writeCache({ tiles, mainImageUrl });
      }
    };

    const configPromise = fetchMosaicConfig();
    configPromise.then((config) => {
      if (!cancelled && config?.mainImageUrl) {
        setFallbackImage(config.mainImageUrl);
      }
    });

    const drawMosaic = async ({ silent = false } = {}) => {
      if (refreshInFlight.current) return;
      refreshInFlight.current = true;
      if (!silent && !hasCacheRef.current) {
        setLoading(true);
        setError("");
      } else if (!silent) {
        setError("");
      }
      try {
        const mosaicConfig = await configPromise;
        const res = await fetch(
          `${apiUrl}/mosaic/tiles?mosaicKey=${encodeURIComponent(mosaicKey)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("No se pudo cargar los tiles.");
        }
        const tilesResponse = await res.json();
        if (!Array.isArray(tilesResponse) || tilesResponse.length === 0) {
          if (mosaicConfig.mainImageUrl && !cancelled && !hasCacheRef.current) {
            setFallbackImage(mosaicConfig.mainImageUrl);
            setLoading(false);
            refreshInFlight.current = false;
            return;
          }
          if (!hasCacheRef.current) {
            throw new Error("No hay tiles para este mosaico.");
          }
          return;
        }

        const tiles = tilesResponse.map((tile) =>
          normalizeTile(tile, mosaicConfig)
        );
        const validTiles = tiles.filter(
          (tile) =>
            Number.isFinite(tile.left) &&
            Number.isFinite(tile.top) &&
            Number.isFinite(tile.width) &&
            Number.isFinite(tile.height)
        );
        if (validTiles.length === 0) {
          if (mosaicConfig.mainImageUrl && !cancelled && !hasCacheRef.current) {
            setFallbackImage(mosaicConfig.mainImageUrl);
            setLoading(false);
            refreshInFlight.current = false;
            return;
          }
          if (!hasCacheRef.current) {
            throw new Error("Tiles incompletos para renderizar el mosaico.");
          }
          return;
        }

        await renderTiles({
          tiles: validTiles,
          mainImageUrl: mosaicConfig.mainImageUrl,
          updateCache: true,
        });
      } catch (err) {
        if (!cancelled && !silent && !hasCacheRef.current) {
          setError(err.message || "No se pudo cargar el mosaico.");
          setLoading(false);
        }
      } finally {
        refreshInFlight.current = false;
      }
    };

    const cached = readCache();
    if (cached) {
      renderTiles({
        tiles: cached.tiles,
        mainImageUrl: cached.mainImageUrl,
        updateCache: false,
      });
    }

    drawMosaic();
    let intervalId = null;
    if (pollIntervalMs > 0) {
      intervalId = window.setInterval(() => {
        if (!cancelled) {
          drawMosaic({ silent: true });
        }
      }, pollIntervalMs);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [apiUrl, mosaicKey, pollIntervalMs]);

  const isEmptyState = error.toLowerCase().includes("no hay tiles");
  const showImage = Boolean(fallbackImage) && (!hasCacheRef.current || loading);
  const showCanvas = !showImage;
  const showPlaceholder =
    !hasCacheRef.current && (loading || (fallbackImage && !fallbackLoaded));
  const placeholderStyle = fallbackImage
    ? {
        background: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.88)), url(${fallbackImage}) center / cover no-repeat`,
      }
    : undefined;

  useEffect(() => {
    if (fallbackImage) {
      setFallbackLoaded(false);
    }
  }, [fallbackImage]);

  return (
    <>
      {loading && <p className="mosaic-state">Cargando mosaico...</p>}
      {error ? (
        <div className="mosaic-fallback">
          <div
            className={`mosaic-fallback-card ${
              isEmptyState ? "is-empty" : "is-error"
            }`}
          >
            <span className="mosaic-fallback-icon">
              {isEmptyState ? "🧩" : "⚠️"}
            </span>
            <h3 className="mosaic-fallback-title">
              {isEmptyState
                ? "Todavía no hay mosaico"
                : "No pudimos cargar el mosaico"}
            </h3>
            <p className="mosaic-fallback-text">
              {isEmptyState
                ? "Sé el primero en aportar tu foto y ayúdanos a construirlo."
                : "Intenta recargar la página en unos segundos."}
            </p>
            <div className="mosaic-fallback-actions">
              <button
                type="button"
                className="mosaic-fallback-btn"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
              <a className="mosaic-fallback-link" href="/">
                Volver al inicio
              </a>
            </div>
            {!isEmptyState && (
              <p className="mosaic-fallback-hint">{error}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mosaic-visual">
          {showPlaceholder && (
            <div
              className="mosaic-placeholder"
              style={placeholderStyle}
              aria-hidden="true"
            >
              <div className="mosaic-spinner" />
              <p className="mosaic-placeholder-text">Preparando mosaico…</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`mosaic-canvas mosaic-fade ${
              showCanvas ? "is-visible" : "is-hidden"
            }`}
          />
          {fallbackImage && (
            <img
              src={fallbackImage}
              alt="Imagen principal"
              className={`mosaic-image mosaic-fade ${
                showImage ? "is-visible" : "is-hidden"
              }`}
              onLoad={() => setFallbackLoaded(true)}
              onError={() => setFallbackLoaded(true)}
            />
          )}
        </div>
      )}
    </>
  );
}
