import React, { useState } from "react";
import axios from "axios";
import "./LoginAdmin.css"; 

function LoginAdmin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/admins/login", { password });
      localStorage.setItem("adminToken", res.data.token);
      setLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return <div className="login-container"><h2>Bienvenido, admin 👋</h2></div>;
  }

  return (
    <div className="login-container">
      <h2>Login Admin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Cargando..." : "Entrar"}</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default LoginAdmin;
