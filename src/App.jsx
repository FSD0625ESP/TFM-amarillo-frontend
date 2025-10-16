import React, { useState } from "react";
import Home from "./pages/Home";

export default function App() {
  const [mode, setMode] = useState("day"); // "day" o "sunset"

  const toggleMode = () => {
    setMode(mode === "day" ? "sunset" : "day");
  };

  return (
    <div>
      <Home />
    </div>
  );
}
