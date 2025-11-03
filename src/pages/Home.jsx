// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import "./Home.css";
import heroPic from "../assets/heroPicSagradaFamilia.png";
import iconNacimiento from "../assets/iconNacimiento.png";
import iconPasion from "../assets/iconPasion.png";
import FactSection from "../components/FactSection";
import { Link } from "react-router-dom";
import PhotoCarousel from "../components/PhotoCarousel";
import MosaicProgressBar from "../components/MosaicProgressBar";
import LiveCamera from "../components/LiveCamera";

export default function Home() {
  const [theme, setTheme] = useState("day");
  const [stats, setStats] = useState({
    fotos: 1523,
    colaboradores: 847,
    paises: 27,
  });

  // Detectar automáticamente la hora local
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) setTheme("sunset");
    else setTheme("day");
  }, []);

  // Aplicar el tema
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
        //onClick={toggleTheme}
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
      {/* FACTS */}
      <section className="fact-section" aria-labelledby="fact-title">
        <div className="fact-inner">
          <FactSection />
        </div>
      </section>
      {/* INTRODUCCIÓN */}
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
            Família para formar parte del mosaico colaborativo que reúna todas
            nuestras miradas y memorias.
          </p>

          <p className="intro-tagline">
            Cada imagen cuenta una parte de esta historia. ¡Suma la tuya ahora!
          </p>

          <div className="intro-cta">
            <Link to="/email" className="btn btn-primary">
              Colabora con tu foto
            </Link>
            <Link to="/mosaic" className="btn-link">
              Ver el mosaico
            </Link>
          </div>
        </div>
      </section>
      {/* HERO MOSAICO */}
      <section className="hero-preview">
        <img
          src={heroPic}
          alt="Vista previa del mosaico colaborativo de la Sagrada Família"
          loading="lazy"
        />
      </section>
      {/* SECCIÓN BARRA DE PROGRESO DEL MOSAICO */}
      <MosaicProgressBar />

      {/* 📊 SECCIÓN DE ESTADÍSTICAS */}
      <section className="stats-section">
        <h3 className="stats-title">Nuestra comunidad en cifras</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{stats.fotos.toLocaleString()}</span>
            <span className="stat-label">Fotos subidas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {stats.colaboradores.toLocaleString()}
            </span>
            <span className="stat-label">Colaboradores</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.paises}</span>
            <span className="stat-label">Países participantes</span>
          </div>
        </div>
      </section>
      {/* 🖼️ SECCIÓN CARRUSEL */}
      <section className="carousel-section">
        <h2 className="section-title">Destacados del mosaico</h2>
        <PhotoCarousel
          images={[
            {
              src: "",
              alt: "Fotografía más antigua del mosaico",
              title: "La más antigua",
              description: "Capturada en 1885 por un visitante desconocido.",
            },
            {
              src: "",
              alt: "Fotografía más reciente del mosaico",
              title: "La más reciente",
              description:
                "Tomada hace solo unos días por un colaborador local.",
            },
            {
              src: "",
              alt: "Fotografía más votada",
              title: "La más votada",
              description: "Favorita entre los visitantes de todo el mundo.",
            },
          ]}
        />
      </section>
      {/* 🔻 FOOTER */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Proyecto colaborativo Sagrada Família API
          — Desarrollado por el equipo Full Stack 2025.
        </p>
        <nav className="footer-links">
          <a href="/about">Sobre el proyecto</a>
          <a href="/api/docs">API Docs</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </footer>
      <LiveCamera />
    </main>
  );
}
