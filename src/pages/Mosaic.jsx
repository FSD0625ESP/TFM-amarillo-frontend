// src/pages/Mosaic.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Mosaic.css";

export default function Mosaic() {
  const [theme, setTheme] = useState("day");
  // Estado para la imagen del mosaico y los datos de tiles
  const [mosaicData, setMosaicData] = useState({ url: null, width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de navegación (Zoom/Pan)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewportRef = useRef(null);
  const contentRef = useRef(null); // Referencia a la imagen <img>
  const panStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  
  // Datos lógicos para calcular clicks (no se renderizan, solo memoria)
  const tilesRef = useRef([]); 
  const baseSizeRef = useRef({ width: 1, height: 1 });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const MIN_SCALE = 0.1; // Permite alejar mucho para ver imágenes gigantes
  const MAX_SCALE = 10;  // Zoom profundo para detalles

  // 1. Gestión del Tema
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) setTheme("sunset");
    else setTheme("day");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 2. Fullscreen Listener
  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // 3. Carga de Datos (Snapshot + Coordenadas)
  useEffect(() => {
    let isMounted = true;
    const loadMosaic = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ejecutamos en paralelo para máxima velocidad
        const [tilesRes, snapshotRes, configRes] = await Promise.all([
          fetch(`${API_URL}/mosaic/tiles?mosaicKey=default`),
          fetch(`${API_URL}/mosaic/snapshots/latest?mosaicKey=default`),
          fetch(`${API_URL}/mosaic/config`),
        ]);

        // Procesar Coordenadas (Esencial para el click)
        if (tilesRes.ok) {
          const tiles = await tilesRes.json();
          if (Array.isArray(tiles)) {
            tilesRef.current = tiles;
            // Calcular tamaño lógico original del grid
            const w = tiles.reduce((acc, t) => Math.max(acc, t.left + t.width), 0);
            const h = tiles.reduce((acc, t) => Math.max(acc, t.top + t.height), 0);
            baseSizeRef.current = { width: w || 1, height: h || 1 };
          }
        }

        // Determinar Imagen a Mostrar
        let finalUrl = null;
        let finalWidth = 0;
        let finalHeight = 0;

        // A) Intentar Snapshot (Prioridad)
        if (snapshotRes.ok) {
          const snap = await snapshotRes.json();
          if (snap && snap.url) {
            finalUrl = snap.url;
            finalWidth = snap.width;
            finalHeight = snap.height;
          }
        }

        // B) Fallback a Imagen Principal (Si no se ha generado snapshot aún)
        if (!finalUrl && configRes.ok) {
          const conf = await configRes.json();
          if (conf && conf.mainImageUrl) {
            finalUrl = conf.mainImageUrl;
          }
        }

        if (isMounted) {
          if (finalUrl) {
            setMosaicData({ url: finalUrl, width: finalWidth, height: finalHeight });
          } else {
            setError("No hay imagen de mosaico disponible.");
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Error conectando con el servidor.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadMosaic();
    return () => { isMounted = false; };
  }, [API_URL]);

  // 4. Lógica de Zoom y Pan (Matemática pura)
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const centerContent = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    
    // Centramos la imagen en su estado actual escalado
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const cw = content.offsetWidth * scale;
    const ch = content.offsetHeight * scale;
    
    setOffset({
      x: Math.round((vw - cw) / 2),
      y: Math.round((vh - ch) / 2),
    });
  }, [scale]);

  // Centrar automáticamente cuando la imagen carga
  const handleImageLoad = () => {
    centerContent();
  };

  const zoomTo = useCallback((nextScale, clientPoint) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    
    // Punto pivote del zoom
    const base = clientPoint
      ? { x: clientPoint.x - rect.left, y: clientPoint.y - rect.top }
      : { x: rect.width / 2, y: rect.height / 2 };

    // Calcular posición relativa antes del zoom
    const normalizedX = (base.x - offset.x) / scale;
    const normalizedY = (base.y - offset.y) / scale;
    
    const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    
    // Nueva posición para mantener el punto bajo el mouse
    const nextOffset = {
      x: base.x - normalizedX * clampedScale,
      y: base.y - normalizedY * clampedScale,
    };

    setScale(clampedScale);
    setOffset(nextOffset);
  }, [offset.x, offset.y, scale]);

  // 5. Lógica "Invisible": Click en Píxel -> Tile Database
  const openTileAtPoint = useCallback((clientX, clientY) => {
    const viewport = viewportRef.current;
    const content = contentRef.current; // La etiqueta <img>
    if (!viewport || !content) return;

    const rect = viewport.getBoundingClientRect();
    
    // A. Coordenada click en la imagen visual (sin escala)
    const clickX_Img = (clientX - rect.left - offset.x) / scale;
    const clickY_Img = (clientY - rect.top - offset.y) / scale;

    // B. Factor de conversión (Imagen Real vs. Grid Lógico)
    // El snapshot puede ser 4000px pero el grid lógico 1000px.
    const logicalW = baseSizeRef.current.width;
    const logicalH = baseSizeRef.current.height;
    const displayedW = content.offsetWidth || 1;
    const displayedH = content.offsetHeight || 1;

    const ratioX = logicalW / displayedW;
    const ratioY = logicalH / displayedH;

    // C. Coordenada final en el sistema de tiles
    const targetX = clickX_Img * ratioX;
    const targetY = clickY_Img * ratioY;

    // D. Buscar match en memoria
    const tile = tilesRef.current.find(
      (t) =>
        targetX >= t.left &&
        targetX <= t.left + t.width &&
        targetY >= t.top &&
        targetY <= t.top + t.height
    );

    if (tile?.matchedUrl) {
      window.open(tile.matchedUrl, "_blank", "noopener,noreferrer");
    }
  }, [offset.x, offset.y, scale]);

  // 6. Event Handlers (Mouse/Touch)
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const delta = event.deltaY;
    const zoomFactor = delta < 0 ? 1.15 : 0.85; // Zoom un poco más ágil
    zoomTo(scale * zoomFactor, { x: event.clientX, y: event.clientY });
  }, [scale, zoomTo]);

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
    // Umbral de movimiento para diferenciar click de drag
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      panStartRef.current.moved = true;
    }
    setOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handlePointerUp = (event) => {
    if (!isPanning) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const wasDragged = panStartRef.current.moved;
    setIsPanning(false);
    
    if (!wasDragged) {
      // Si fue un click limpio, abrimos la foto
      openTileAtPoint(event.clientX, event.clientY);
    }
  };

  const handleReset = () => {
    setScale(1);
    centerContent();
  };

  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await viewportRef.current?.parentElement?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <main className="mosaic-page">
      <header className="mosaic-header">
        <h1 className="mosaic-title">Mosaico Colaborativo</h1>
        <p className="mosaic-subtitle">
          Explora el mural global en alta definición. Haz click para ver las fotos originales.
        </p>
      </header>

      <section className="mosaic-container">
        <div className="mosaic-viewer">
          {/* Barra de Herramientas */}
          <div className="mosaic-toolbar">
            <button className="mosaic-btn" onClick={() => zoomTo(scale * 1.25)} aria-label="Acercar" title="Zoom In">+</button>
            <button className="mosaic-btn" onClick={() => zoomTo(scale * 0.8)} aria-label="Alejar" title="Zoom Out">−</button>
            <span className="mosaic-zoom">{Math.round(scale * 100)}%</span>
            <button className="mosaic-btn" onClick={handleReset} title="Centrar">Reset</button>
            <button className="mosaic-btn" onClick={handleToggleFullscreen} title="Pantalla Completa">
              {isFullscreen ? "Salir" : "Full"}
            </button>
          </div>

          {/* Área de Visualización */}
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
                className="mosaic-scale"
                style={{ transform: `scale(${scale})` }}
              >
                {isLoading && (
                   <div className="mosaic-loading-overlay">
                     <div className="mosaic-spinner"></div>
                     <p>Cargando mosaico...</p>
                   </div>
                )}
                
                {error && (
                  <div className="mosaic-fallback">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                  </div>
                )}

                {/* IMAGEN NATIVA - El núcleo del nuevo sistema */}
                {mosaicData.url && !error && (
                  <img
                    ref={contentRef}
                    src={mosaicData.url}
                    alt="Mosaico completo"
                    className="mosaic-highres-image"
                    draggable={false}
                    onLoad={handleImageLoad}
                  />
                )}
              </div>
            </div>
          </div>
          
          <p className="mosaic-help">
            Arrastra para mover • Scroll para zoom • Click para ver original
          </p>
        </div>
      </section>
    </main>
  );
}