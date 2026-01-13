import React, { useState } from "react";
import axios from "axios";
import "./EmailForm.css";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage("");

    try {
      // 🔵 Intentar registro
      await axios.post(
        `${import.meta.env.VITE_API_URL}/emails/send-magic-link`,
        { email }
      );

      setMessage("📧 Te enviamos un enlace para completar tu registro.");
    } catch (err) {
      // 🟡 Si ya existe → pedir link de edición
      if (err.response?.status === 409) {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/emails/send-edit-link`,
            { email }
          );

          setMessage(
            "📧 Este correo ya estaba registrado. Te enviamos un enlace para editar tus fotos."
          );
        } catch (editErr) {
          console.error(editErr);
          setMessage(
            "❌ El correo está registrado, pero no se pudo enviar el enlace de edición."
          );
        }
      } else {
        console.error("❌ Error enviando Magic Link:", err);
        setMessage("❌ No se pudo enviar el enlace. Verifica tu correo.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-form-container">
      <h2>Para subir tu foto necesitamos tu correo electrónico</h2>
      <p>Introduce tu correo aquí</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Recibir enlace"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
