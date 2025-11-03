import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import EmailForm from "./pages/EmailForm"; // Página donde el usuario escribe solo su email
import MagicLinkVerification from "./pages/MagicLinkVerification"; // Página de verificación del enlace mágico
import UserRegistration from "./pages/UserRegistration"; // Página donde el usuario completa los datos para subir su primera foto o fotos
import UserRegistrationSecondPage from "./pages/UserRegistrationSecondPage"; // Página con NOMBRE, MAIL, PAIS precargados en los datos del usuario que quiere subir más fotos

import "./App.css";

function App() {
  // Leer el modo guardado o usar "day" por defecto
  const [mode, setMode] = useState(
    () => localStorage.getItem("themeMode") || "day"
  );

  // Guardar el modo en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Alternar entre modos
  const toggleMode = () => {
    setMode((prev) => (prev === "day" ? "sunset" : "day"));
  };

  return (
    <div className={`app-container ${mode}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<MagicLinkVerification />} />
          <Route path="/email" element={<EmailForm />} />
          <Route path="/registration" element={<UserRegistration />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
