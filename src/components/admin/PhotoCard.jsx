import React from "react";

export default function PhotoCard({ photo, onDelete }) {
  return (
    <div className="rounded-lg shadow bg-white p-4">
      <img
        src={photo.imageUrl}
        alt={photo.title}
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h3 className="font-semibold">{photo.title}</h3>
      <p className="text-sm text-gray-600">{photo.description}</p>
      <p className="text-sm text-gray-500 mt-1">Año: {photo.year}</p>
      <p className="text-sm text-gray-500">Likes: {photo.likes}</p>
      <p className="text-sm text-gray-500">
        Usuario:{" "}
        <a
          href="#usuarios"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {photo.owner?.email || "Sin email"}
        </a>
      </p>
      <button
        onClick={() => onDelete(photo._id)}
        className="mt-3 bg-red-500 text-white p-2 rounded hover:bg-red-600"
        title="Eliminar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          alt="Eliminar foto"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
      <button
        onClick={() => alert("Funcionalidad de ocultar próximamente")}
        className="mt-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 ml-2"
        title="Ocultar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          alt="Ocultar foto"
        >
          <path d="M17.94 17.94A10.95 10.95 0 0 1 12 20c-5 0-9.27-3-11-8a11.64 11.64 0 0 1 5.17-6.11" />
          <path d="M1 1l22 22" />
          <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
          <path d="M12 12a3 3 0 0 1 3 3" />
          <path d="M21 21a10.94 10.94 0 0 0 2-6" />
        </svg>
      </button>
      <button
        onClick={() => alert("Funcionalidad de edición próximamente")}
        className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ml-2"
        title="Editar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          alt="Editar foto"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
    </div>
  );
}