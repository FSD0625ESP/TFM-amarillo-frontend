import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "./UserPage.css";

const UserPage = () => {
  const [searchParams] = useSearchParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/emails/verify-token?token=${encodeURIComponent(
            token
          )}`
        );
        if (res.data?.email) {
          localStorage.setItem("verifiedEmail", res.data.email.toLowerCase());
        }
        if (res.data?.token) {
          localStorage.setItem("userToken", res.data.token);
        }
        if (res.data?.userId && res.data?.email) {
          const userData = { _id: res.data.userId, email: res.data.email };
          if (res.data?.country) {
            userData.country = res.data.country;
          }
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      } catch (err) {
        console.error("Error verificando enlace:", err);
        setError("El enlace no es válido o ha expirado.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

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
     <button
  onClick={() =>
    window.location.href = `/add-photos?token=${token}`
  }
>
  ➕ Subir otra foto
</button>

      {loading ? (
        <p>Cargando todas tus fotos...</p>
      ) : error ? (
        <p className="error">{error}</p>
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
