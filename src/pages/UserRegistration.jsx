import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import "./UserRegistration.css";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

const shareUrl = "https://tusitiooficial.com";
const title = "¡Acabo de subir mi foto al Proyecto Amarillo 💛!";

Modal.setAppElement("#root");

function UserRegistration() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    country: "",
    story: "",
    photoYear: "",
    title: "",
    photos: [],
  });

  // 🔍 Verificar token
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/emails/verify-token?token=${token}`
        );
        setEmail(res.data.email);
        if (res.data.email) {
          localStorage.setItem("verifiedEmail", res.data.email.toLowerCase());
        }
        setVerified(true);
      } catch {
        setMessage("El enlace ha expirado o no es válido.");
      }
    };
    verifyToken();
  }, [token]);

  // ✏️ Manejar inputs
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photos") {
      setFormData({ ...formData, photos: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 🚀 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("email", email); // 👈 owner de la foto
    data.append("name", formData.name);
    data.append("age", formData.age);
    data.append("country", formData.country);
    data.append("story", formData.story);
    data.append("year", formData.photoYear);
    data.append("title", formData.title);
    formData.photos.forEach((file) => data.append("photos", file));

    try {
      const res = await axios.post(
        "http://localhost:3000/emails/complete",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage(res.data.message || "Foto subida correctamente.");
      setModalOpen(true);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Error al subir la fotografía."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!verified) return <p>{message || "Verificando enlace..."}</p>;

  return (
    <div className="registro-container">
      <h2>Completa tu registro</h2>

      <form onSubmit={handleSubmit}>
        <input type="email" value={email} disabled />

        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Edad"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="country"
          placeholder="País"
          onChange={handleChange}
          required
        />
        <textarea
          name="story"
          placeholder="Cuéntanos tu historia"
          onChange={handleChange}
          required
        ></textarea>

        <input
          type="number"
          name="photoYear"
          placeholder="Año de la foto"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="title"
          placeholder="Título de la foto"
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="photos"
          accept="image/*"
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Subiendo..." : "Registrar"}
        </button>
      </form>

      {message && <p className="mensaje">{message}</p>}

      {/* ✅ Modal de confirmación */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Registro Completo"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>🎉 ¡Felicidades, {formData.name}! 🎉</h2>
        <p>
          Tu foto ha sido añadida al mosaico colaborativo de la Sagrada Família.
        </p>
        <p className="success-subtext">
          Gracias por formar parte de este homenaje colectivo 💛
        </p>

        {/* 🌍 Botones de compartir */}
        <div className="share-container">
          <FacebookShareButton url={shareUrl} quote={title}>
            <FacebookIcon size={40} round />
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} title={title}>
            <TwitterIcon size={40} round />
          </TwitterShareButton>
          <WhatsappShareButton url={shareUrl} title={title}>
            <WhatsappIcon size={40} round />
          </WhatsappShareButton>
        </div>

        <div className="modal-buttons">
          <button onClick={() => (window.location.href = "/home")}>
            Ver mosaico
          </button>
          <button onClick={() => setModalOpen(false)}>Cerrar</button>
        </div>
      </Modal>
    </div>
  );
}

export default UserRegistration;
