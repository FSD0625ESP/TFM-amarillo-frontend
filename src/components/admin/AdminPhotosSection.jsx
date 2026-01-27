import React from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import ReactFlagsSelect from "react-flags-select";
import PhotoGrid from "./PhotoGrid";
import { formatCountry } from "../../countryUtils";

export default function AdminPhotosSection({
  selectedUser,
  editingCountry,
  countryDraft,
  savingCountry,
  onStartEditCountry,
  onCancelEditCountry,
  onCountrySelect,
  onSaveCountry,
  onShowAllPhotos,
  loadingPhotos,
  userPhotos,
  togglingPhotoId,
  deletingPhotoId,
  onTogglePhotoVisibility,
  onEditPhoto,
  onDeletePhoto,
  loadingAllPhotos,
  photos,
  onPhotoOwnerClick,
}) {
  return (
    <div>
      {selectedUser ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4 border-b pb-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Perfil de colaborador
              </p>
              <h2 className="text-2xl font-semibold leading-tight break-all">
                {selectedUser.email || selectedUser.id}
              </h2>
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                {selectedUser.name && (
                  <span className="px-3 py-1 rounded-full bg-gray-100">
                    {selectedUser.name}
                  </span>
                )}
                {selectedUser.age && (
                  <span className="px-3 py-1 rounded-full bg-gray-100">
                    {selectedUser.age} años
                  </span>
                )}
                {selectedUser.country && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 flex items-center gap-2">
                    {formatCountry(selectedUser.country)}
                    {!editingCountry && (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline"
                        onClick={onStartEditCountry}
                      >
                        Editar
                      </button>
                    )}
                  </span>
                )}
              </div>
              {editingCountry && (
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <ReactFlagsSelect
                    searchable
                    selected={countryDraft}
                    onSelect={onCountrySelect}
                    placeholder="Selecciona país"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled={savingCountry}
                      onClick={onSaveCountry}
                    >
                      {savingCountry ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={onCancelEditCountry}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={onShowAllPhotos}
              type="button"
            >
              Ver todas las fotos
            </button>
          </div>
          {loadingPhotos ? (
            <p>Cargando fotos...</p>
          ) : userPhotos.length === 0 ? (
            <p className="opacity-60">Este usuario no tiene fotos.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {userPhotos.map((photo) => (
                <div
                  key={photo.id || photo.url}
                  className="rounded-lg shadow bg-white p-4 space-y-2"
                >
                  <div className="relative">
                    <img
                      src={photo.imageUrl || photo.url}
                      alt={`Foto subida por ${
                        selectedUser.email || selectedUser.id
                      }`}
                      className={`w-full h-48 object-cover rounded mb-2 ${
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
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {photo.title || "Sin título"}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Descripción:</span>{" "}
                      {photo.description || "Sin descripción"}
                    </p>
                    <p className="text-xs text-gray-500 break-all">
                      <span className="font-semibold">URL:</span>{" "}
                      <a
                        href={photo.imageUrl || photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        {photo.imageUrl || photo.url}
                      </a>
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Año:</span>{" "}
                      {photo.year ?? "No especificado"}
                    </p>
                  </div>
                  <p className="text-xs font-semibold">
                    Estado:{" "}
                    <span
                      className={
                        photo.hidden ? "text-amber-600" : "text-emerald-600"
                      }
                    >
                      {photo.hidden ? "Oculta" : "Visible"}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      className={`btn btn-sm ${
                        photo.hidden ? "btn-success" : "btn-warning"
                      }`}
                      disabled={togglingPhotoId === (photo._id || photo.id)}
                      onClick={() => onTogglePhotoVisibility(photo)}
                      type="button"
                    >
                      {togglingPhotoId === (photo._id || photo.id) ? (
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
                      type="button"
                      onClick={() => onEditPhoto(photo)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      type="button"
                      onClick={() => onDeletePhoto(photo)}
                      disabled={deletingPhotoId === (photo._id || photo.id)}
                    >
                      {deletingPhotoId === (photo._id || photo.id)
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : loadingAllPhotos ? (
        <p>Cargando fotos...</p>
      ) : photos.length === 0 ? (
        <p className="opacity-60">No hay fotos para mostrar.</p>
      ) : (
        <PhotoGrid
          photos={photos}
          onUserClick={onPhotoOwnerClick}
          onDeletePhoto={onDeletePhoto}
          onToggleHidden={onTogglePhotoVisibility}
          onEditPhoto={onEditPhoto}
          deletingPhotoId={deletingPhotoId}
          togglingPhotoId={togglingPhotoId}
        />
      )}
    </div>
  );
}
