import React, { useState } from "react";
import "./UserRegistration.css";

function UserRegistration() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    pais: "",
    fotos: [],
    historia: "",
    anio: "",
    terminos: false,
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [colaboradorNum, setColaboradorNum] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, fotos: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    // Simula envío de Magic Link al email
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      // Simulamos número de colaborador recibido del backend
      const randomNum = Math.floor(Math.random() * 10000);
      setColaboradorNum(randomNum);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="registro-container">
        <h2>¡¡¡Felicidades!!!</h2>
        <p>
          Eres el colaborador <strong>#{colaboradorNum}</strong> 🎉
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

      <form onSubmit={handleSubmit}>
        <div className="row">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
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
        </div>

        <label className="label">
          ¿Desde dónde nos mandas tu foto?
          <select
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona tu país</option>
            <option value="España">España</option>
            <option value="México">México</option>
            <option value="Argentina">Argentina</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Otro">Otro</option>
          </select>
        </label>

        <label className="label">
          Comparte tu foto aquí
          <input
            type="file"
            name="fotos"
            multiple
            accept="image/*"
            onChange={handleChange}
            required
          />
          <small>Puedes subir de 1 a 5 imágenes</small>
        </label>

        {formData.fotos.length > 0 && (
          <div className="barra-carga">
            <div
              className="progreso"
              style={{
                width: `${(formData.fotos.length / 5) * 100}%`,
              }}
            ></div>
          </div>
        )}

        <label className="label">
          Cuéntanos la historia de tu foto
          <textarea
            name="historia"
            maxLength="140"
            placeholder="(Campo opcional, máx. 140 caracteres)"
            value={formData.historia}
            onChange={handleChange}
          />
        </label>

        <label className="label">
          Año de tu foto
          <select
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un año</option>
            {Array.from({ length: 2026 - 1882 }, (_, i) => 1882 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </label>

        <div className="terminos">
          <label>
            <input
              type="checkbox"
              name="terminos"
              checked={formData.terminos}
              onChange={handleChange}
              required
            />{" "}
            Acepto los términos y condiciones
          </label>
        </div>

        <button type="submit" disabled={sending}>
          {sending ? "Enviando MagicLink..." : "Finalizar"}
        </button>
      </form>
    </div>
  );
}

export default UserRegistration;
