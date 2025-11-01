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
import { getHighlightedPhotos } from "../services/photoService";

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

  //logica de las fotos del carrousel
  const [highlighted, setHighlighted] = useState(null);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    const fetchHighlighted = async () => {
      try {
        const data = await getHighlightedPhotos();
        setHighlighted(data);
        const slides = [
          data?.oldestByYear?.imageUrl,
          data?.newestUploaded?.imageUrl,
          data?.mostLiked?.imageUrl,
        ].filter(Boolean);
        setSlideCount(slides.length);
        console.log("✅ Highlighted seteado correctamente:", data);
        console.log("🔍 URLs recibidas:", {
          oldest: data?.oldestByYear?.imageUrl,
          newest: data?.newestUploaded?.imageUrl,
          mostLiked: data?.mostLiked?.imageUrl,
        });
      } catch (error) {
        console.error("Error al cargar fotos destacadas:", error);
      }
    };
    fetchHighlighted();
  }, []);

  // autoplay del carrusel
  useEffect(() => {
    if (!highlighted || slideCount === 0) return;
    const slides = Array.from({ length: slideCount }, (_, i) => `#slide-${i + 1}`);
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % slides.length;
      window.location.hash = slides[index];
    }, 5000);
    return () => clearInterval(interval);
  }, [highlighted, slideCount]);

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
        {!highlighted ? (
          <p>Cargando...</p>
        ) : (
          <div
            key={JSON.stringify(highlighted)}
            className="carousel w-full max-w-3xl mx-auto rounded-lg shadow-lg overflow-x-auto"
          >
            <div className="carousel-inner flex w-full">
              {(() => {
                const rawSlides = [
                  {
                    title: "La más antigua",
                    description: `Capturada en ${highlighted.oldestByYear?.year || "año desconocido"}.`,
                    src: highlighted.oldestByYear?.imageUrl,
                  },
                  {
                    title: "La más reciente",
                    description: "Tomada recientemente por un colaborador.",
                    src: highlighted.newestUploaded?.imageUrl,
                  },
                  {
                    title: "La más votada",
                    description: `Con ${highlighted.mostLiked?.likes || 0} likes.`,
                    src: highlighted.mostLiked?.imageUrl,
                  },
                ].filter(slide => !!slide.src);

                return rawSlides.map((slide, index) => {
                  const id = `slide-${index + 1}`;
                  const total = rawSlides.length;
                  const prev = `#slide-${(index - 1 + total) % total + 1}`;
                  const next = `#slide-${(index + 1) % total + 1}`;

                  return (
                    <div key={id} id={id} className="carousel-item relative w-full">
                      <img
                        src={slide.src}
                        alt={slide.title}
                        className="w-full object-contain max-h-[500px]"
                      />
                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-4">
                        <h3 className="text-lg font-semibold">{slide.title}</h3>
                        <p>{slide.description}</p>
                      </div>
                      <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                        <a href={prev} className="btn btn-circle">❮</a>
                        <a href={next} className="btn btn-circle">❯</a>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
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
