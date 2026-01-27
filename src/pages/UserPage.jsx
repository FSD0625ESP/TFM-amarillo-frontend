import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import "./UserPage.css";
import "./UserRegistration.css";

Modal.setAppElement("#root");

function UserPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  // modal + form
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const START_YEAR = 1882;
  const CURRENT_YEAR = new Date().getFullYear();
  const YEAR_OPTIONS = Array.from(
    { length: CURRENT_YEAR - START_YEAR + 1 },
    (_, i) => START_YEAR - i
  );
  const [year, setYear] = useState("");
  const [files, setFiles] = useState([]);

  // 🔐 Cargar usuario + fotos
  useEffect(() => {
    const load = async () => {
      try {
        const verify = await axios.get(
          `http://localhost:3000/emails/verify-token?token=${token}`
        );

        if (verify.data.action !== "edit") {
          throw new Error("No autorizado");
        }

        const userEmail = verify.data.email;
        setEmail(userEmail);

        const res = await axios.get(
          "http://localhost:3000/emails/me/photos",
          { params: { email: userEmail } }
        );

        setName(res.data.name);
        setPhotos(res.data.photos);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar tu información");
      }
    };

    load();
  }, [token]);

  // 📤 SUBIR FOTO NUEVA
  const handleAddPhoto = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();
    data.append("email", email); 
    data.append("title", title);
    data.append("description", description);
    data.append("year", year);

    files.forEach((file) => data.append("photos", file));

    await axios.post(
      "http://localhost:3000/emails/add-photos",
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // limpiar
    setModalOpen(false);
    setTitle("");
    setDescription("");
    setYear("");
    setFiles([]);

    // recargar fotos
    const res = await axios.get(
      "http://localhost:3000/emails/me/photos",
      { params: { email } }
    );
    setPhotos(res.data.photos);
  } catch (err) {
    console.error(err);
    alert("Error subiendo la foto");
  }
};


  if (error) return <p>{error}</p>;

  return (
    <div className="user-page">
      <h2>📸 Tus fotos</h2>

      <div className="user-meta">
        <p><strong>Bienvenido de vuelta, {name}</strong></p>
        <p>{email}</p>
      </div>

      <div className="user-actions">
        <button onClick={() => (window.location.href = "/")}>Home</button>
        <button onClick={() => (window.location.href = "/gallery")}>Galería</button>
        <button onClick={() => (window.location.href = "/mosaic")}>Mosaico</button>
        <button onClick={() => setModalOpen(true)}>➕ Agregar foto</button>
      </div>

      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img src={photo.imageUrl} alt={photo.title || "Foto"} />
            <div className="photo-info">
              <h4>{photo.title}</h4>
              <p>{photo.description}</p>
              <span className="likes">❤️ {photo.likes || 0}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
  isOpen={modalOpen}
  onRequestClose={() => setModalOpen(false)}
  className="modal-content"
  overlayClassName="modal-overlay"
>
  <h2>➕ Añadir nueva foto</h2>

  <form onSubmit={handleAddPhoto}>
    {/* TÍTULO */}
    <input
      type="text"
      placeholder="Título de la foto"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />

    {/* DESCRIPCIÓN */}
    <textarea
      placeholder="Descripción"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      required
    />

    {/* AÑO (MISMA LÓGICA QUE REGISTRO) */}
    <select
      value={year}
      onChange={(e) => setYear(e.target.value)}
      required
    >
      <option value="" disabled>
        Año de la foto (desde 1882)
      </option>
      {YEAR_OPTIONS.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>

    {/* FOTO */}
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setFiles([...e.target.files])}
      required
    />

    <div className="modal-buttons">
      <button type="submit">Subir foto</button>
      <button type="button" onClick={() => setModalOpen(false)}>
        Cancelar
      </button>
    </div>
  </form>
</Modal>  
    </div>
  );
}

export default UserPage;
