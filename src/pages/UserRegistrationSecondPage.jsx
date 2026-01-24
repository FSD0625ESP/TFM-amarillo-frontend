import React, { useState, useEffect } from "react";
import "./UserRegistrationSecondPage.css";
import { registerUser } from "../services/CreateUser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SuccessScreen from "../components/SuccessScreen";
import { formatCountry } from "../countryUtils";

function UserRegistrationSecondPage() {
  const storedUser = JSON.parse(localStorage.getItem("userData")) || {};
  const [formData, setFormData] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    country: storedUser.country || "",
    photos: [],
    story: "",
    year: "",
    terms: false,
  });

  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [colaboradorNum, setColaboradorNum] = useState(null);
  const [errores, setErrores] = useState([]);
  const [photoYear, setPhotoYear] = useState(null);
  const [photoLimitError, setPhotoLimitError] = useState("");

  useEffect(() => {
    if (!storedUser.email) {
      alert("⚠️ No hay datos de usuario cargados. Redirigiendo al registro...");
      window.location.href = "/email";
    } else {
      localStorage.setItem("verifiedEmail", storedUser.email.toLowerCase());
    }
  }, [storedUser]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      const newPhotos = Array.from(files);
      if (newPhotos.length > 5) {
        setPhotoLimitError("Solo puedes subir un máximo de 5 fotografías.");
      } else {
        setPhotoLimitError("");
        setFormData({ ...formData, photos: newPhotos });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrores([]);

    if (formData.photos.length === 0) {
      setErrores([
        { path: "photos", msg: "Por favor, selecciona al menos una foto." },
      ]);
      setSending(false);
      return;
    }

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "photos") {
          value.forEach((foto) => formPayload.append("photos", foto));
        } else {
          formPayload.append(key, value);
        }
      });

      const response = await registerUser(formPayload);
      setColaboradorNum(response.data.colaboradorNum);
      setSubmitted(true);
    } catch (error) {
      console.error("❌ Error al subir fotos:", error);
      setErrores([{ path: "general", msg: "Error al subir fotografías." }]);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return <SuccessScreen colaboradorNum={colaboradorNum} />;
  }

  return (
    <div className="upload-container">
      <h2>Sube tus nuevas fotografías</h2>
      <p className="user-info-text">
        Usuario: <strong>{formData.name}</strong> ({formData.email})<br />
        País:{" "}
        <strong>
          {formatCountry(formData.country) || formData.country || "—"}
        </strong>
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset disabled>
          <input type="text" name="name" value={formData.name} readOnly />
          <input type="email" name="email" value={formData.email} readOnly />
          <input
            type="text"
            name="country"
            value={formatCountry(formData.country) || formData.country}
            readOnly
          />
        </fieldset>

        <label htmlFor="photos">Selecciona hasta 5 nuevas fotografías:</label>
        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          onChange={handleChange}
        />
        {photoLimitError && <p className="error">{photoLimitError}</p>}

        <textarea
          name="story"
          placeholder="Describe brevemente tus nuevas fotos..."
          value={formData.story}
          onChange={handleChange}
        />

        <DatePicker
          selected={photoYear}
          onChange={(date) => {
            setPhotoYear(date);
            setFormData({ ...formData, photoYear: date.getFullYear() });
          }}
          showYearPicker
          dateFormat="yyyy"
          placeholderText="Año de las fotos"
          className="year-picker"
        />

        <label className="terms-label">
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
          />
          Confirmo que las imágenes que estoy subiendo son de mi autoría o tengo
          permiso para subirlas.
        </label>

        <button type="submit" disabled={sending}>
          {sending ? "Subiendo..." : "Enviar fotografías"}
        </button>
      </form>

      {errores.length > 0 && (
        <div className="error-list">
          {errores.map((err, idx) => (
            <p key={idx} className="error">
              {err.msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserRegistrationSecondPage;
