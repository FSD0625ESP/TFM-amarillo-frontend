import React from "react";

export default function AdminHome({
  adminName,
  onlineCount,
  onlineUsers,
  tilesCount,
  mainImageUrl,
  uploadingMainImage,
  onUploadMainImage,
  tileWidth,
  onTileWidthChange,
  tileHeight,
  onTileHeightChange,
  mosaicKey,
  onMosaicKeyChange,
  mosaicWidth,
  onMosaicWidthChange,
  mosaicHeight,
  onMosaicHeightChange,
  useAutoRatio,
  onToggleAutoRatio,
  resolvedHeight,
  allowReuse,
  onAllowReuseChange,
  reuseAfterExhaustion,
  onReuseAfterExhaustionChange,
  autoEnabled,
  onAutoEnabledChange,
  savingAuto,
  intervalHours,
  onIntervalHoursChange,
  refreshSeconds,
  onRefreshSecondsChange,
  concurrency,
  onConcurrencyChange,
  onSaveAutoConfig,
  savingConfig,
  onGenerateTiles,
  generatingTiles,
  onGenerateMosaic,
  mosaicBusy,
  mosaicError,
  mosaicSnapshot,
  snapshotsError,
  loadingSnapshots,
  mosaicSnapshots,
  onRefreshSnapshots,
  onOpenSnapshot,
  onRequestDeleteSnapshot,
}) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Bienvenido, {adminName}</h1>
      <p className="text-gray-600 mb-3">
        Desde este panel puedes gestionar fotos, usuarios, facts y ver
        estadísticas.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-700">Usuarios online ahora:</span>
        <span className="badge badge-success badge-outline">{onlineCount}</span>
        {onlineUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {onlineUsers.slice(0, 5).map((u, idx) => (
              <span key={u.id || u.email || idx} className="badge badge-neutral">
                {u.email || u.id}
              </span>
            ))}
            {onlineUsers.length > 5 && (
              <span className="badge badge-ghost">
                +{onlineUsers.length - 5} más
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 mosaic-admin-card">
        <div className="mosaic-header">
          <div>
            <h2>Generar mosaico</h2>
            <p className="mosaic-subtitle">
              Sube la imagen principal, define los tiles y genera el mosaico
              final.
            </p>
          </div>
          {tilesCount !== null && (
            <span className="mosaic-pill">Tiles: {tilesCount}</span>
          )}
        </div>

        <div className="mosaic-upload">
          <label>
            Imagen principal (se sube a Cloudinary)
            <input
              type="file"
              accept="image/*"
              onChange={onUploadMainImage}
              className="file-input file-input-bordered file-input-sm"
              disabled={uploadingMainImage}
            />
          </label>
          {mainImageUrl && (
            <div className="mosaic-link">
              <span>URL:</span>
              <a href={mainImageUrl} target="_blank" rel="noopener noreferrer">
                {mainImageUrl}
              </a>
            </div>
          )}
          {mainImageUrl && (
            <div className="mosaic-preview">
              <span className="mosaic-preview-label">
                Imagen principal activa
              </span>
              <div className="mosaic-preview-card">
                <img src={mainImageUrl} alt="Imagen principal" />
              </div>
            </div>
          )}
        </div>

        <div className="mosaic-grid">
          <label>
            <span
              className="mosaic-tooltip"
              data-tooltip="Ancho de cada tile (cuadradito) en píxeles. Ej: 20 = 20px."
            >
              Tile width (px)
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={tileWidth}
              onChange={(e) => onTileWidthChange(e.target.value)}
              className="input input-bordered input-sm"
            />
          </label>
          <label>
            <span
              className="mosaic-tooltip"
              data-tooltip="Alto de cada tile en píxeles. Ej: 20 = 20px."
            >
              Tile height (px)
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={tileHeight}
              onChange={(e) => onTileHeightChange(e.target.value)}
              className="input input-bordered input-sm"
            />
          </label>
          <label>
            <span
              className="mosaic-tooltip"
              data-tooltip="Identificador del mosaico. Sirve para separar mosaicos distintos."
            >
              mosaicKey
            </span>
            <input
              type="text"
              value={mosaicKey}
              onChange={(e) => onMosaicKeyChange(e.target.value)}
              className="input input-bordered input-sm"
              placeholder="default"
            />
          </label>
          <label>
            <span
              className="mosaic-tooltip"
              data-tooltip="Ancho final de la imagen del mosaico."
            >
              Ancho (px)
            </span>
            <input
              type="number"
              min="200"
              step="100"
              value={mosaicWidth}
              onChange={(e) => onMosaicWidthChange(e.target.value)}
              className="input input-bordered input-sm"
            />
          </label>
          <label>
            <span
              className="mosaic-tooltip"
              data-tooltip={
                useAutoRatio
                  ? "Se calcula automáticamente con la imagen principal."
                  : "Alto final de la imagen del mosaico."
              }
            >
              Alto (px)
            </span>
            <input
              type="number"
              min="200"
              step="100"
              value={useAutoRatio ? resolvedHeight : mosaicHeight}
              onChange={(e) => onMosaicHeightChange(e.target.value)}
              className="input input-bordered input-sm"
              disabled={useAutoRatio}
            />
          </label>
        </div>

        <div className="mosaic-actions">
          <div className="mosaic-checkboxes">
            <label className="mosaic-checkbox">
              <input
                type="checkbox"
                checked={useAutoRatio}
                onChange={(e) => onToggleAutoRatio(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span
                className="mosaic-tooltip"
                data-tooltip="Calcula el alto usando la proporción de la imagen principal."
              >
                Auto ratio
              </span>
            </label>
            <label className="mosaic-checkbox">
              <input
                type="checkbox"
                checked={allowReuse}
                onChange={(e) => onAllowReuseChange(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              Reutilizar fotos
            </label>
            <label className="mosaic-checkbox">
              <input
                type="checkbox"
                checked={reuseAfterExhaustion}
                onChange={(e) => onReuseAfterExhaustionChange(e.target.checked)}
                className="checkbox checkbox-sm"
                disabled={allowReuse}
              />
              <span
                className="mosaic-tooltip"
                data-tooltip="Usa cada foto una vez y luego vuelve a reutilizar cuando se agotan."
              >
                Reusar al agotar
              </span>
            </label>
            <label className="mosaic-checkbox">
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => onAutoEnabledChange(e.target.checked)}
                className="checkbox checkbox-sm"
                disabled={savingAuto}
              />
              Modo automático
            </label>
            <label className="mosaic-inline-field">
              <span
                className="mosaic-inline-label mosaic-tooltip"
                data-tooltip="Cada cuántas horas se genera automáticamente un mosaico en el backend."
              >
                Intervalo (h)
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={intervalHours}
                onChange={(e) => onIntervalHoursChange(e.target.value)}
                className="input input-bordered input-xs"
              />
            </label>
            <label className="mosaic-inline-field">
              <span
                className="mosaic-inline-label mosaic-tooltip"
                data-tooltip="Intervalo en segundos para refrescar el mosaico en la página pública. 0 = desactivar."
              >
                Refresco (s)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={refreshSeconds}
                onChange={(e) => onRefreshSecondsChange(e.target.value)}
                className="input input-bordered input-xs"
              />
            </label>
            <label className="mosaic-inline-field">
              <span
                className="mosaic-inline-label mosaic-tooltip"
                data-tooltip="Número de tiles que se procesan en paralelo al renderizar el mosaico."
              >
                Concurrency
              </span>
              <input
                type="number"
                min="1"
                max="16"
                step="1"
                value={concurrency}
                onChange={(e) => onConcurrencyChange(e.target.value)}
                className="input input-bordered input-xs"
              />
            </label>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={onSaveAutoConfig}
              disabled={savingConfig}
            >
              {savingConfig ? "Guardando..." : "Guardar config"}
            </button>
          </div>
          <div className="mosaic-buttons">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onGenerateTiles}
              disabled={generatingTiles}
            >
              {generatingTiles ? "Generando..." : "Generar tiles"}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onGenerateMosaic}
              disabled={mosaicBusy}
            >
              {mosaicBusy ? "Generando..." : "Generar mosaico"}
            </button>
          </div>
        </div>

        {mosaicError && <p className="mosaic-error-text">{mosaicError}</p>}
        {mosaicSnapshot?.url && (
          <p className="mosaic-success-text">
            Mosaico generado:{" "}
            <a href={mosaicSnapshot.url} target="_blank" rel="noopener noreferrer">
              Ver imagen
            </a>
          </p>
        )}
      </div>

      <div className="mt-6 mosaic-admin-card">
        <div className="mosaic-header">
          <div>
            <h2>Mosaicos generados</h2>
            <p className="mosaic-subtitle">Histórico de mosaicos renderizados.</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onRefreshSnapshots}
            disabled={loadingSnapshots}
          >
            {loadingSnapshots ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {snapshotsError && <p className="mosaic-error-text">{snapshotsError}</p>}

        {loadingSnapshots ? (
          <p className="mosaic-empty">Cargando mosaicos...</p>
        ) : mosaicSnapshots.length === 0 ? (
          <p className="mosaic-empty">Todavía no hay mosaicos generados.</p>
        ) : (
          <div className="mosaic-snapshots">
            {mosaicSnapshots.map((snapshot) => {
              const snapshotKey =
                snapshot._id || snapshot.publicId || snapshot.url;
              const snapshotUrl = snapshot.url || "";
              const snapshotDate = snapshot.createdAt
                ? new Date(snapshot.createdAt).toLocaleString("es-ES")
                : null;
              const canDelete = Boolean(snapshot._id);
              return (
                <article
                  key={snapshotKey}
                  className={`mosaic-snapshot-card ${
                    snapshotUrl ? "mosaic-snapshot-link" : ""
                  }`}
                  role={snapshotUrl ? "button" : undefined}
                  tabIndex={snapshotUrl ? 0 : -1}
                  onClick={() => onOpenSnapshot(snapshotUrl)}
                  onKeyDown={(event) => {
                    if (!snapshotUrl) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenSnapshot(snapshotUrl);
                    }
                  }}
                >
                  <div className="mosaic-snapshot-image">
                    {snapshotUrl ? (
                      <img
                        src={snapshotUrl}
                        alt={snapshot.mosaicKey || "Mosaico"}
                      />
                    ) : (
                      <div className="mosaic-snapshot-placeholder">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="mosaic-snapshot-body">
                    <div>
                      <p className="mosaic-snapshot-title">
                        {snapshot.mosaicKey || "mosaico"}
                      </p>
                      <p className="mosaic-snapshot-meta">
                        {snapshot.width || snapshot.outputWidth || "?"} x{" "}
                        {snapshot.height || snapshot.outputHeight || "?"}
                      </p>
                      {snapshotDate && (
                        <p className="mosaic-snapshot-date">{snapshotDate}</p>
                      )}
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        className="btn btn-xs btn-error"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onRequestDeleteSnapshot(snapshot);
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
