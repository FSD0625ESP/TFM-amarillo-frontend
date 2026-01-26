import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Mosaic from "./pages/Mosaic";
import AddPhotos from "./pages/AddPhoto";
import Gallery from "./pages/Gallery";
import CookieBanner from "./components/Cookies";

// 🔹 Magic Link / Registro
import EmailForm from "./pages/EmailForm";
import UserRegistration from "./pages/UserRegistration";
import UserPage from "./pages/UserPage";

// 🔹 Admin
import Admin from "./pages/Admin";
import AdminLogin from "./components/admin/AdminLogin";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import "./App.css";
import OnlinePresenceConnector from "./components/OnlinePresenceConnector";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  // 🔸 Theme Mode (viene de MAIN)
  const [mode, setMode] = useState(
    () => localStorage.getItem("themeMode") || "day"
  );

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Alternar entre modos
  const toggleMode = () => {
    setMode((prev) => (prev === "day" ? "sunset" : "day"));
  };

  // --- Rutas ---
  return (
    <div className={`app-container ${mode}`}>
      <OnlinePresenceConnector currentPath={location.pathname} />
      <CookieBanner />
      <Routes>
        <Route path="/" element={<Home toggleMode={toggleMode} />} />
        <Route path="/mosaic" element={<Mosaic />} />

        {/* RUTA DE LA GALERÍA DE COMUNIDAD */}
        <Route path="/gallery" element={<Gallery />} />

        {/* Magic Link */}
        <Route path="/email" element={<EmailForm />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/userPage" element={<UserPage />} />
        <Route path="/AddPhotos" element={<AddPhotos />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/adminlogin" element={<AdminLogin />} />
      </Routes>
    </div>
  );
}

export default App;
