import React, { useEffect, useState } from "react";
import "./UserPage.css";

const UserPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's photos from the backend
  /* useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/user/photos"); // Reemplazar por nuestro endpoint
        const data = await response.json();
        setPhotos(data);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);
  */

  // Handle photo deletion
  const handleDelete = async (photoId) => {
    try {
      const response = await fetch(`/api/user/photos/${photoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPhotos((prevPhotos) =>
          prevPhotos.filter((photo) => photo.id !== photoId)
        );
      } else {
        console.error("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  return (
    <div className="user-page">
      <div className="user-page-header">
        <h1>Tus fotos compartidas de la Sagrada Familia</h1>
      </div>

      {loading ? (
        <p>Cargando todas tus fotos...</p>
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <p>Aún no has compartido ninguna foto</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div className="photo-card" key={photo.id}>
              <img src={photo.url} alt={photo.title || "User photo"} />
              <button
                className="delete-button"
                onClick={() => handleDelete(photo.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPage;
