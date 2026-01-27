// src/pages/Mosaic.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Mosaic.css";
import MosaicCanvas from "../components/MosaicCanvas";

export default function Mosaic() {
  const [theme, setTheme] = useState("day");
  const [pollIntervalMs, setPollIntervalMs] = useState(30000);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewportRef = useRef(null);
  const scaleRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const tilesRef = useRef([]);
  const baseSizeRef = useRef({ width: 1, height: 1 });
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;

  // Tema automático coherente con la Home
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) setTheme("sunset");
    else setTheme("day");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/mosaic/config`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        const parsedRefresh = Number(data?.refreshSeconds);
        if (Number.isFinite(parsedRefresh) && parsedRefresh >= 0) {
          if (isMounted) {
            setPollIntervalMs(parsedRefresh * 1000);
          }
        }
      } catch (err) {
        // Silent fallback to default polling.
      }
    };
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const centerWithScale = useCallback((targetScale) => {
    const viewport = viewportRef.current;
    const content = scaleRef.current;
    if (!viewport || !content) return;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const cw = content.offsetWidth * targetScale;
    const ch = content.offsetHeight * targetScale;
    setOffset({
      x: Math.round((vw - cw) / 2),
      y: Math.round((vh - ch) / 2),
    });
  }, []);

  const centerContent = useCallback(() => {
    centerWithScale(scale);
  }, [centerWithScale, scale]);

  const zoomTo = useCallback(
    (nextScale, clientPoint) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const base = clientPoint
        ? {
            x: clientPoint.x - rect.left,
            y: clientPoint.y - rect.top,
          }
        : {
            x: rect.width / 2,
            y: rect.height / 2,
          };
      const normalizedX = (base.x - offset.x) / scale;
      const normalizedY = (base.y - offset.y) / scale;
      const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const nextOffset = {
        x: base.x - normalizedX * clamped,
        y: base.y - normalizedY * clamped,
      };
      setScale(clamped);
      setOffset(nextOffset);
    },
    [offset.x, offset.y, scale]
  );

  useEffect(() => {
    const id = window.requestAnimationFrame(centerContent);
    return () => window.cancelAnimationFrame(id);
  }, [centerContent]);

  useEffect(() => {
    const handleResize = () => {
      window.requestAnimationFrame(centerContent);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [centerContent]);

  useEffect(() => {
    if (!isFullscreen) return;
    const id = window.requestAnimationFrame(centerContent);
    return () => window.cancelAnimationFrame(id);
  }, [centerContent, isFullscreen]);

  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();
      const delta = event.deltaY;
      const zoomFactor = delta < 0 ? 1.1 : 0.9;
      const nextScale = scale * zoomFactor;
      zoomTo(nextScale, { x: event.clientX, y: event.clientY });
    },
    [scale, zoomTo]
  );

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
    panStartRef.current = {
      x: offset.x,
      y: offset.y,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    if (!isPanning) return;
    const dx = event.clientX - panStartRef.current.startX;
    const dy = event.clientY - panStartRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      panStartRef.current.moved = true;
    }
    setOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const openTileAtPoint = useCallback(
    (clientX, clientY) => {
      const viewport = viewportRef.current;
      const content = scaleRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const xCss = (clientX - rect.left - offset.x) / scale;
      const yCss = (clientY - rect.top - offset.y) / scale;
      const baseWidth = baseSizeRef.current.width || 1;
      const baseHeight = baseSizeRef.current.height || 1;
      const scaleX =
        content && content.offsetWidth ? baseWidth / content.offsetWidth : 1;
      const scaleY =
        content && content.offsetHeight ? baseHeight / content.offsetHeight : 1;
      const x = xCss * scaleX;
      const y = yCss * scaleY;
      const tiles = tilesRef.current || [];
      const tile = tiles.find(
        (item) =>
          x >= item.left &&
          x <= item.left + item.width &&
          y >= item.top &&
          y <= item.top + item.height
      );
      if (tile?.matchedUrl) {
        window.open(tile.matchedUrl, "_blank", "noopener,noreferrer");
      }
    },
    [offset.x, offset.y, scale]
  );

  const handlePointerUp = (event) => {
    if (!isPanning) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const wasDragged = panStartRef.current.moved;
    setIsPanning(false);
    if (!wasDragged) {
      openTileAtPoint(event.clientX, event.clientY);
    }
  };

  const handleReset = () => {
    setScale(1);
    centerWithScale(1);
  };

  const handleToggleFullscreen = async () => {
    const target = viewportRef.current?.parentElement;
    if (!target) return;
    if (!document.fullscreenElement) {
      await target.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <main className="mosaic-page">
      <header className="mosaic-header">
        <h1 className="mosaic-title">Mosaico colaborativo</h1>
        <p className="mosaic-subtitle">
          Visualiza en tiempo real la construcción del mosaico global.
        </p>
      </header>

      <section className="mosaic-container">
        <div className="mosaic-viewer">
          <div className="mosaic-toolbar">
            <button
              type="button"
              className="mosaic-btn"
              onClick={() => zoomTo(scale * 1.1)}
              aria-label="Acercar"
              title="Acercar"
            >
              +
            </button>
            <button
              type="button"
              className="mosaic-btn"
              onClick={() => zoomTo(scale * 0.9)}
              aria-label="Alejar"
              title="Alejar"
            >
              −
            </button>
            <span className="mosaic-zoom">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              className="mosaic-btn"
              onClick={handleReset}
              aria-label="Centrar y resetear"
              title="Centrar y resetear"
            >
              Reset
            </button>
            <button
              type="button"
              className="mosaic-btn"
              onClick={handleToggleFullscreen}
              aria-label="Pantalla completa"
              title="Pantalla completa"
            >
              {isFullscreen ? "Salir" : "Full"}
            </button>
          </div>
          <div
            ref={viewportRef}
            className={`mosaic-viewport ${isPanning ? "is-panning" : ""}`}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onDoubleClick={handleReset}
          >
            <div
              className="mosaic-stage"
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
              }}
            >
              <div
                ref={scaleRef}
                className="mosaic-scale"
                style={{ transform: `scale(${scale})` }}
              >
                <MosaicCanvas
                  apiUrl={API_URL}
                  mosaicKey="default"
                  pollIntervalMs={pollIntervalMs}
                  onTilesReady={(tiles) => {
                    const normalized = tiles || [];
                    tilesRef.current = normalized;
                    if (normalized.length) {
                      const width = normalized.reduce(
                        (maxWidth, tile) =>
                          Math.max(maxWidth, tile.left + tile.width),
                        0
                      );
                      const height = normalized.reduce(
                        (maxHeight, tile) =>
                          Math.max(maxHeight, tile.top + tile.height),
                        0
                      );
                      baseSizeRef.current = {
                        width: width || 1,
                        height: height || 1,
                      };
                    } else {
                      baseSizeRef.current = { width: 1, height: 1 };
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <p className="mosaic-help">
            Click en un tile para abrir la foto • Arrastra para mover • Scroll
            para zoom • Doble click para resetear
          </p>
        </div>
      </section>
    </main>
  );
}
