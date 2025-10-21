import React, { useState } from "react";
import "./UserRegistration.css";
import { registerUser } from "../services/CreateUser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function UserRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    photos: [],
    story: "",
    age: "",
    photoYear: "",
    terms: false,
  });

  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [colaboradorNum, setColaboradorNum] = useState(null);
  const [errores, setErrores] = useState([]);
  const [photoYear, setPhotoYear] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, photos: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrores([]);

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("email", formData.email);
      formPayload.append("country", formData.country);
      formData.photos.forEach((foto) => {
      formPayload.append("photos", foto);
      });
      formPayload.append("story", formData.story);
      formPayload.append("age", formData.age || "");
      formPayload.append("terms", formData.terms);
      formPayload.append("photoYear", formData.photoYear || "");

     const response = await registerUser(formPayload);

      setColaboradorNum(response.data.colaboradorNum);
      setSubmitted(true);
    } catch (error) {
  console.error("❌ Error al registrar usuario:", error);

  if (error.response?.data?.errors) {
    // Errores de validación de express-validator
    setErrores(error.response.data.errors);
  } else if (error.response?.data?.message) {
    // Errores personalizados del backend (correo duplicado, por ejemplo)
    setErrores([{ path: "general", msg: error.response.data.message }]);
  } else {
    // Cualquier otro error desconocido
    setErrores([{ path: "general", msg: "Error interno del servidor." }]);
  }
    } finally {
      setSending(false);
    }
  };

  const getError = (campo) => {
    const error = errores.find((err) => err.path === campo);
    return error ? error.msg : null;
  };

  if (submitted) {
    return (
      <div className="registro-container">
        <h2>¡¡¡Felicidades!!!</h2>
        <p>
          Eres el colaborador <strong>{colaboradorNum}</strong> 🎉
        </p>
        <div className="acciones">
          <button>📸 Compártelo en redes</button>
          <button>🖼️ Mira el resto de fotos</button>
          <button>🧩 Ver avance del mosaico</button>
        </div>
      </div>
    );
  }

  return (
    <div className="registro-container">
      <h2>Formulario de colaboración</h2>

      {errores.length > 0 && (
        <div className="errores-validacion">
          <ul>
            {errores.map((err, index) => (
              <li key={index}>
                <strong>{err.path}:</strong> {err.msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {getError("name") && <span className="error">{getError("name")}</span>}

        <input
          type="number"
          name="age"
          placeholder="Edad(años)"
          value={formData.age}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {getError("email") && <span className="error">{getError("email")}</span>}

        <input
          type="text"
          name="country"
          placeholder="País"
          value={formData.country}
          onChange={handleChange}
          required
        />
        {getError("country") && <span className="error">{getError("country")}</span>}

        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          onChange={handleChange}
          required
        />


        <textarea
          name="story"
          placeholder="Tu historia"
          value={formData.story}
          onChange={handleChange}
        ></textarea>

        <DatePicker
          selected={photoYear}
          onChange={(date) => {
            setPhotoYear(date);
            setFormData({ ...formData, photoYear: date.getFullYear() });
          }}
          showYearPicker
          dateFormat="yyyy"
          placeholderText="Año de la foto"
          className="year-picker"
        />
        {getError("story") && <span className="error">{getError("story")}</span>}
        
        {getError("age") && <span className="error">{getError("age")}</span>}

        <label>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
          />
          Acepto los términos y condiciones
        </label>

        <button type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Finalizar"}
        </button>
      </form>
    </div>
  );
}

export default UserRegistration;