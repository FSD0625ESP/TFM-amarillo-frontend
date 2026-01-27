import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./UserPage.css";

function UserPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // 🔐 1. Verificar token
        const verify = await axios.get(
          `http://localhost:3000/emails/verify-token?token=${token}`
        );

        if (verify.data.action !== "edit") {
          throw new Error("No autorizado");
        }

        const userEmail = verify.data.email;
        setEmail(userEmail);

        // 📸 2. Traer info + fotos del usuario
        const res = await axios.get(
          "http://localhost:3000/emails/me/photos",
          { params: { email: userEmail } }
        );

        setName(res.data.name);        // ✅ nombre
        setPhotos(res.data.photos);    // ✅ fotos + likes
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar tu información");
      }
    };

    load();
  }, [token]);

  if (error) return <p>{error}</p>;

  return (
    <div className="user-page">
      <h2>📸 Tus fotos</h2>

      <div className="user-meta">
        <p><strong>{name}</strong></p>
        <p>{email}</p>
      </div>

      <div className="user-actions">
        <button onClick={() => (window.location.href = "/")}>Home</button>
        <button onClick={() => (window.location.href = "/gallery")}>Galería</button>
        <button onClick={() => (window.location.href = "/mosaic")}>Mosaico</button>
      </div>

      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img
              src={photo.imageUrl}
              alt={photo.title || "Foto"}
            />
            <div className="photo-info">
              <h4>{photo.title}</h4>
              <p>{photo.description}</p>
              <span className="likes">❤️ {photo.likes || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserPage;
