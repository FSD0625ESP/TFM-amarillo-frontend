// src/pages/Mosaic.jsx
import React, { useEffect, useState } from "react";
import "./Mosaic.css";
import MosaicComponent from "../components/MosaicComponent";

export default function Mosaic() {
  const [theme, setTheme] = useState("day");

  // Tema automático coherente con la Home
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) setTheme("sunset");
    else setTheme("day");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <main className="mosaic-page">
      <header className="mosaic-header">
        <h1 className="mosaic-title">Mosaico colaborativo</h1>
        <p className="mosaic-subtitle">
          Visualiza en tiempo real la construcción del mosaico global.
        </p>
      </header>

      <section className="mosaic-container">
        <MosaicComponent />
      </section>
    </main>
  );
}
