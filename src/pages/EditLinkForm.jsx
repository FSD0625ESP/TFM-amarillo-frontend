import { useState } from "react";
import axios from "axios";
import "./EmailForm.css"; 

export default function EditLinkForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/emails/send-edit-link`,
        { email }
      );
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      console.error("❌ Error enviando enlace de edición:", err);
      const backendMsg = err.response?.data?.message;
      if (backendMsg) {
        setMessage(`❌ ${backendMsg}`);
      } else {
        setMessage(
          "❌ No se pudo enviar el enlace. Intenta de nuevo más tarde."
        );
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Tu correo registrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Recibir enlace para editar mis fotos"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
