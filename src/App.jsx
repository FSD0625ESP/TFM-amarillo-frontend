import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Mosaic from "./pages/Mosaic";

// 🔹 Magic Link / Registro
import EmailForm from "./pages/EmailForm";
import MagicLinkVerification from "./pages/MagicLinkVerification";
import UserRegistration from "./pages/UserRegistration";
import RequestMagicLink from "./pages/RequestMagicLink";

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
      <Routes>
        <Route path="/" element={<Home toggleMode={toggleMode} />} />
        <Route path="/mosaic" element={<Mosaic />} />

        {/* Magic Link */}
        <Route path="/email" element={<EmailForm />} />
        <Route path="/verify" element={<MagicLinkVerification />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/magic" element={<RequestMagicLink />} />

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
