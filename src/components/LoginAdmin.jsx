import React, { useState } from "react";
import "./LoginAdmin.css";

function LoginAdmin() {
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // Simulación de credenciales
  const adminCredentials = {
    admin1: "clave123",
    admin2: "clave2025",
    admin3: "contrasenia123",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const correctPassword = adminCredentials[adminName.toLowerCase()];

    if (correctPassword && password === correctPassword) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setLoggedIn(true);
      }, 1500);
    } else {
      setError("Nombre o contraseña incorrectos. Inténtalo de nuevo.");
    }
  };

  if (loggedIn) {
    return (
      <div className="login-container">
        <h2>Bienvenido, {adminName} 👋</h2>
        <p className="login-success-text">
          Has accedido correctamente al panel de administración.
        </p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>Login Administrador</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del administrador"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
