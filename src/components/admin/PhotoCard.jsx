import React from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";

export default function PhotoCard({
  photo,
  onDelete,
  onUserClick,
  onToggleHidden,
  onEdit,
  deleting = false,
  toggling = false,
}) {
  const imageSrc = photo.imageUrl || photo.url || photo.thumbnail;
  const ownerEmail = photo.owner?.email || photo.ownerEmail || photo.email;
  const title = photo.title || photo.name || "Sin título";
  const description =
    photo.description || photo.story || "Sin descripción disponible";
  const year = photo.year || photo.photoYear || "-";
  const likes = photo.likes ?? photo.likesCount ?? 0;

  return (
    <div className="rounded-lg shadow bg-white p-4 space-y-2">
      <div className="relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className={`w-full h-48 object-cover rounded mb-2 ${
              photo.hidden ? "opacity-60" : ""
            }`}
          />
        ) : (
          <div className="w-full h-48 rounded mb-2 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
            Imagen no disponible
          </div>
        )}
        {photo.hidden && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="badge badge-warning text-xs sm:text-sm px-3 py-1 shadow">
              Foto oculta
            </span>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {photo.hidden && (
          <span className="badge badge-warning text-xs">Oculta</span>
        )}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-sm text-gray-500 mt-1">Año: {year}</p>
      <p className="text-sm text-gray-500">Likes: {likes}</p>
      <p className="text-sm text-gray-500">
        Usuario:{" "}
        <button
          type="button"
          onClick={() => onUserClick?.(photo)}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {ownerEmail || "Sin email"}
        </button>
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => onToggleHidden?.(photo)}
          className={`btn btn-sm ${photo.hidden ? "btn-success" : "btn-warning"}`}
          disabled={toggling}
          type="button"
        >
          {toggling ? (
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
          onClick={() => onEdit?.(photo)}
          className="btn btn-sm btn-neutral"
          type="button"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete?.(photo)}
          className="btn btn-sm btn-error"
          disabled={deleting}
          type="button"
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}
