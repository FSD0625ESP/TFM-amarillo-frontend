import React, { useState } from "react";
import "./LoginAdmin.css";

function LoginAdmin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const correctPassword = "admin123"; // cambia esta contraseña según necesites

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password === correctPassword) {
      setLoading(true);
      // Simula carga del sistema
      setTimeout(() => {
        setLoading(false);
        setLoggedIn(true);
      }, 2000);
    } else {
      setError("Contraseña incorrecta. Inténtalo de nuevo.");
    }
  };

  if (loggedIn) {
    return (
      <div className="login-container">
        <h2>Bienvenido, administrador 👋</h2>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>Login Admin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Introduce la contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <div className="spinner"></div>}
    </div>
  );
}

export default LoginAdmin;
