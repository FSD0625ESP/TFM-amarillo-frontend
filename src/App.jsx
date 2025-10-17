import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import UserRegistration from "./pages/UserRegistration";

export default function App() {
  const [mode, setMode] = useState("day"); // "day" o "sunset"

  const toggleMode = () => {
    setMode(mode === "day" ? "sunset" : "day");
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registration" element={<UserRegistration />} />
    </Routes>
  );
}
