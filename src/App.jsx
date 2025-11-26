import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

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

function App() {
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home toggleMode={toggleMode} />} />

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
      </BrowserRouter>
    </div>
  );
}

export default App;