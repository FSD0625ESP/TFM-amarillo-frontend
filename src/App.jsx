import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import UserRegistration from "./pages/UserRegistration";
import EmailForm from "./pages/EmailForm";
import MagicLinkVerification from "./pages/MagicLinkVerification";
import Admin from "./pages/Admin";
import AdminLogin from "./components/admin/AdminLogin";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import RequestMagicLink from "./pages/RequestMagicLink";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<MagicLinkVerification />} />
          <Route path="/email" element={<EmailForm />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>}/>
          <Route path="/adminlogin" element={<AdminLogin />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
