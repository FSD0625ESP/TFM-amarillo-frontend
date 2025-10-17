// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import "./Home.css";
import heroPic from "../assets/heroPicSagradaFamilia.png";
import iconNacimiento from "../assets/iconNacimiento.png";
import iconPasion from "../assets/iconPasion.png"; // <-- ruta correcta
import FactSection from "../components/FactSection";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function Home() {
  const [theme, setTheme] = useState("day");

  // Detectar automáticamente la hora local al cargar la página
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) {
      setTheme("sunset");
    } else {
      setTheme("day");
    }
  }, []);

  // Aplicar el tema al documento
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "day" ? "sunset" : "day"));
  };

  return (
    <main className="home">
      {/* Botón para alternar el modo manualmente */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Cambiar entre modo día y atardecer"
      >
        <img
          src={theme === "day" ? iconPasion : iconNacimiento}
          alt={
            theme === "day"
              ? "Modo día - Fachada Nacimiento"
              : "Modo atardecer - Fachada Pasión"
          }
          className="theme-icon"
        />
      </button>

      {/* Sección de introducción */}
      <section className="intro-section" aria-labelledby="intro-title">
        <div className="intro-inner">
          <h2 id="intro-title" className="intro-title">
            Un homenaje colaborativo a la Sagrada Família
          </h2>

          <p className="intro-text">
            Con motivo de la inauguración de la Sagrada Família en 2026, hemos
            querido rendir nuestro pequeño homenaje con este proyecto
            colaborativo, nacido como trabajo final de Máster en Full Stack
            Development.
          </p>

          <p className="intro-text">
            Inspirados por el espíritu participativo de Barcelona, invitamos a
            cualquier persona a aportar su propia fotografía de la Sagrada
            Família, sin importar su fecha, ángulo o color, para formar parte
            del mosaico colaborativo del monumento que reúna todas nuestras
            historias y memorias.
          </p>

          <p className="intro-tagline">
            Cada imagen cuenta una parte de esta historia. Suma la tuya ahora!
          </p>

          <div className="intro-cta">
            <Link to="/registration" className="btn btn-primary">
              Colabora con tu foto
            </Link>
            <a href="/mosaic" className="btn-link">
              Ver el mosaico
            </a>
          </div>
        </div>
      </section>

      {/* Imagen hero del mosaico */}
      <section className="hero-preview">
        <img
          src={heroPic}
          alt="Vista previa del mosaico colaborativo de la Sagrada Família"
          loading="lazy"
        />
      </section>
    </main>
  );
}
