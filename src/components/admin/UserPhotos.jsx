import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaEyeSlash, FaEye } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserPhotos() {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    year: "",
  });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getPhotoId = (photo) => photo?._id || photo?.id;

  const applyPhotoUpdate = (updated) => {
    const updatedId = getPhotoId(updated);
    setPhotos((prev) =>
      prev.map((p) => (getPhotoId(p) === updatedId ? updated : p))
    );
  };

  const toggleHidden = async (photoId, currentHidden) => {
    try {
      setTogglingId(photoId);
      const { data } = await axios.put(`${API_URL}/photos/${photoId}`, {
        hidden: !currentHidden,
      });
      applyPhotoUpdate(data);
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert(
        error.response?.data?.message ||
          "No se pudo actualizar la visibilidad de la foto."
      );
    } finally {
      setTogglingId(null);
    }
  };

  const openEditModal = (photo) => {
    setEditingPhoto(photo);
    setEditForm({
      title: photo.title || "",
      description: photo.description || "",
      year: photo.year ? String(photo.year) : "",
    });
    setEditError("");
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingPhoto(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePhotoEdit = async (e) => {
    e.preventDefault();
    if (!editingPhoto) return;
    const trimmedTitle = editForm.title.trim();
    if (!trimmedTitle) {
      setEditError("El título es obligatorio.");
      return;
    }
    if (editForm.year && Number.isNaN(Number(editForm.year))) {
      setEditError("El año debe ser un número válido.");
      return;
    }
    setSavingEdit(true);
    setEditError("");
    try {
      const payload = {
        title: trimmedTitle,
        description: (editForm.description ?? "").trim(),
        year: editForm.year === "" ? null : Number(editForm.year),
      };
      const { data } = await axios.put(
        `${API_URL}/photos/${getPhotoId(editingPhoto)}`,
        payload
      );
      applyPhotoUpdate(data);
      setEditingPhoto(null);
    } catch (error) {
      console.error("Error guardando la foto:", error);
      setEditError(
        error.response?.data?.message || "No se pudieron guardar los cambios."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const requestDeletePhoto = (photo) => {
    setPhotoToDelete(photo);
  };

  const handleConfirmDeletePhoto = async () => {
    const photoId = getPhotoId(photoToDelete);
    if (!photoId) return;
    try {
      setDeletingId(photoId);
      await axios.delete(`${API_URL}/photos/${photoId}`);
      setPhotos((prev) => prev.filter((p) => getPhotoId(p) !== photoId));
      setPhotoToDelete(null);
    } catch (error) {
      console.error("Error eliminando foto:", error);
      alert(
        error.response?.data?.message || "No se pudo eliminar la foto."
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await axios.get(`${API_URL}/photos/user/${userId}`);
        setPhotos(res.data);
      } catch (error) {
        console.error("Error obteniendo fotos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [userId]);

  if (loading) return <p className="p-6">Cargando fotos...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Fotos de: <span className="font-mono">{userId}</span>
      </h2>

      <Link to="/admin" className="btn btn-outline mb-4">
        ← Volver al Panel
      </Link>

      {photos.length === 0 ? (
        <p>Este usuario no tiene fotos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => {
            const photoId = getPhotoId(photo);
            return (
            <div
              key={photoId}
              className="border rounded-lg shadow p-3 flex flex-col gap-3"
            >
              <div className="relative">
                <img
                  src={photo.imageUrl || photo.url}
                  alt={photo.title || "Foto del proyecto"}
                  className={`rounded-lg w-full object-cover max-h-60 ${
                    photo.hidden ? "opacity-60" : ""
                  }`}
                />
                {photo.hidden && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="badge badge-warning text-xs sm:text-sm px-3 py-1 shadow">
                      Foto oculta
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="font-semibold">{photo.title || "Sin título"}</p>
                <p className="text-sm opacity-70">
                  {photo.description || "Sin descripción"}
                </p>
                <p className="text-sm opacity-70">Likes: {photo.likes ?? 0}</p>
                <p className="text-xs opacity-60">
                  Estado:{" "}
                  <span
                    className={
                      photo.hidden ? "text-amber-600" : "text-emerald-600"
                    }
                  >
                    {photo.hidden ? "Oculta" : "Visible"}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${
                    photo.hidden ? "btn-success" : "btn-warning"
                  }`}
                  disabled={togglingId === photoId}
                  onClick={() => toggleHidden(photoId, photo.hidden)}
                >
                  {togglingId === photoId ? (
                    "Actualizando..."
                  ) : photo.hidden ? (
                    <span className="flex items-center gap-2">
                      <FaEye /> Mostrar
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FaEyeSlash /> Ocultar
                    </span>
                  )}
                </button>
                <button
                  className="btn btn-sm btn-neutral"
                  onClick={() => openEditModal(photo)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => requestDeletePhoto(photo)}
                  disabled={deletingId === photoId}
                >
                  {deletingId === photoId ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {editingPhoto && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">Editar foto</h3>
            <form className="space-y-4" onSubmit={handleSavePhotoEdit}>
              <label className="form-control w-full">
                <span className="label-text">Título</span>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  value={editForm.title}
                  onChange={handleEditInputChange}
                  required
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text">Descripción</span>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  value={editForm.description}
                  onChange={handleEditInputChange}
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
                  onChange={handleEditInputChange}
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
                  onClick={closeEditModal}
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
      )}

      {photoToDelete && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Eliminar foto</h3>
            <p className="mb-4">
              ¿Seguro que deseas eliminar{" "}
              <strong>{photoToDelete.title || "esta foto"}</strong>? Esta acción
              no se puede deshacer.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setPhotoToDelete(null)}
                disabled={deletingId === getPhotoId(photoToDelete)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleConfirmDeletePhoto}
                disabled={deletingId === getPhotoId(photoToDelete)}
              >
                {deletingId === getPhotoId(photoToDelete)
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
