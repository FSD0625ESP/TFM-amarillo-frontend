import React, { useState } from "react";
import "./UserRegistration.css";
import { registerUser } from "../services/CreateUser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SuccessScreen from "../components/SuccessScreen";

function UserRegistration() {
  const verifiedEmail = localStorage.getItem("verifiedEmail");
  const [formData, setFormData] = useState({
    name: "",
    email: verifiedEmail || "",
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
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "photos")
          value.forEach((foto) => formPayload.append("photos", foto));
        else formPayload.append(key, value);
      });

      const response = await registerUser(formPayload);
      setColaboradorNum(response.data.colaboradorNum);
      setSubmitted(true);
    } catch (error) {
      console.error("❌ Error al registrar usuario:", error);
      setErrores([{ path: "general", msg: "Error al registrar usuario." }]);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return <SuccessScreen colaboradorNum={colaboradorNum} />;
  }

  return (
    <div className="registro-container">
      <h2>Formulario de colaboración</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Edad (años)"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="country"
          placeholder="País"
          value={formData.country}
          onChange={handleChange}
          required
        />
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
        />
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
