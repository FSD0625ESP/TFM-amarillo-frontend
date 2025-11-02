import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import UserRegistration from "./pages/UserRegistration";
import EmailForm from "./pages/EmailForm";
import MagicLinkVerification from "./pages/MagicLinkVerification";
import Admin from "./pages/Admin";
import LoginAdmin from "./components/LoginAdmin";

function App() {
  const [mode, setMode] = useState("day"); // "day" o "sunset"

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
          <Route path="/admin" element={<Admin/>}></Route>
          <Route path="/loginAdmin" element={<LoginAdmin/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
