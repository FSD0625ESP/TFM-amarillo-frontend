import React from "react";

export default function EditPhotoModal({
  editingPhoto,
  editForm,
  editError,
  savingEdit,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!editingPhoto) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">Editar foto</h3>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="form-control w-full">
            <span className="label-text">Título</span>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full"
              value={editForm.title}
              onChange={onChange}
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text">Descripción</span>
            <textarea
              name="description"
              className="textarea textarea-bordered"
              value={editForm.description}
              onChange={onChange}
              rows={3}
            ></textarea>
          </label>

          <label className="form-control w-full">
            <span className="label-text">Año</span>
            <input
              type="number"
              name="year"
              className="input input-bordered w-full"
              value={editForm.year}
              onChange={onChange}
              min="0"
            />
          </label>

          {editError && (
            <p className="text-sm text-error" role="alert">
              {editError}
            </p>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={savingEdit}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingEdit}
            >
              {savingEdit ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
