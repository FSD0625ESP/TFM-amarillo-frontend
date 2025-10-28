import React, { useState } from "react";
import axios from "axios";
import "./UserRegistration.css";

export default function RequestMagicLink() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/emails/magic-link", { email });
      setMsg(res.data.message || "Enlace enviado.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error al enviar el enlace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <h2>Solicita tu enlace mágico ✨</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          placeholder="tucorreo@dominio.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>

      {msg && <p className="error">{msg}</p>}
    </div>
  );
}
