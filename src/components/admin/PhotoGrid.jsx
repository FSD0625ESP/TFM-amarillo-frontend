

import React from "react";
import PhotoCard from "./PhotoCard";

export default function PhotoGrid({
  photos,
  title = "Todas las fotos",
  onUserClick,
  onDeletePhoto,
  onToggleHidden,
  onEditPhoto,
  deletingPhotoId,
  togglingPhotoId,
}) {
  return (
    <section className="p-6 space-y-4" id="fotos">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo._id || photo.id || photo.url}
            photo={photo}
            onUserClick={onUserClick}
            onDelete={onDeletePhoto}
            onToggleHidden={onToggleHidden}
            onEdit={onEditPhoto}
            deleting={deletingPhotoId === (photo._id || photo.id)}
            toggling={togglingPhotoId === (photo._id || photo.id)}
          />
        ))}
      </div>
    </section>
  );
}
