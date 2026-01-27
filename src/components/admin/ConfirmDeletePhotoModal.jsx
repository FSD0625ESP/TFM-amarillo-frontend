import React from "react";

export default function ConfirmDeletePhotoModal({
  photoToDelete,
  deletingPhotoId,
  onCancel,
  onConfirm,
}) {
  if (!photoToDelete) return null;

  const busy =
    deletingPhotoId === (photoToDelete._id || photoToDelete.id);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Eliminar foto</h3>
        <p className="mb-4">
          ¿Seguro que deseas eliminar{" "}
          <strong>{photoToDelete.title || "esta foto"}</strong>? Esta acción no
          se puede deshacer.
        </p>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
