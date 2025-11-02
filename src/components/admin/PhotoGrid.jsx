

import React from "react";
import PhotoCard from "./PhotoCard";

export default function PhotoGrid({ photos }) {
  return (
    <section className="p-6 space-y-4" id="fotos">
      <h2 className="text-xl font-bold mb-4">Todas las fotos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <PhotoCard key={photo._id} photo={photo} />
        ))}
      </div>
    </section>
  );
}