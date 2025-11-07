import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import "./AdminLogin.css"; 

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("adminToken")) {
  return <Navigate to="/admin" replace />;
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/admins/login", {
        username: username,
        password,
      });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminName", res.data.username);
      setLoggedIn(true);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login Administrador</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del administrador"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ cursor: "pointer" }}
            aria-label="Mostrar/Ocultar contraseña"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12a16.88 16.88 0 014-5.73" />
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-3.42" />
                <path d="M9.88 9.88a3.5 3.5 0 014.24 4.24" />
                <path d="M12 4a9.77 9.77 0 018.54 5 16.88 16.88 0 01-1.54 2.5" />
              </svg>
            )}
          </span>
        </div>
        <button type="submit" disabled={loading}>{loading ? "Cargando..." : "Entrar"}</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default AdminLogin;
