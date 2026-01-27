import React from "react";

export default function ConfirmDeleteSnapshotModal({
  snapshotToDelete,
  deletingSnapshotId,
  onCancel,
  onConfirm,
}) {
  if (!snapshotToDelete) return null;

  const busy = deletingSnapshotId === snapshotToDelete._id;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Eliminar mosaico</h3>
        <p className="mb-4">
          ¿Seguro que deseas eliminar{" "}
          <strong>{snapshotToDelete.mosaicKey || "este mosaico"}</strong>? Se
          borrará definitivamente de la base de datos y de Cloudinary.
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
