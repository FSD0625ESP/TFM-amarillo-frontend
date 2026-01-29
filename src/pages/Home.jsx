// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import "./Home.css";
import heroPic from "../assets/heroPicSagradaFamilia.png";
import iconNacimiento from "../assets/iconNacimiento.png";
import iconPasion from "../assets/iconPasion.png";
import FactSection from "../components/FactSection";
import useOnlineUsers from "../hooks/useOnlineUsers";
import { Link, useNavigate } from "react-router-dom";
import MosaicProgressBar from "../components/MosaicProgressBar";
import LiveCamera from "../components/LiveCamera";
import { getHighlightedPhotos } from "../services/photoService";
import { getPublicStats } from "../services/statsService";
import AboutModal from "../components/AboutModal";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  const goToUserPage = () => {
    const token = localStorage.getItem("userToken");

    if (!token || token === "null" || token === "undefined") {
      navigate("/email"); // placeholder
      return;
    }

    navigate("/userPage");
  };

  const {
    total: onlineTotal = 0,
    anonymousCount = 0,
    count: registeredOnline = 0,
  } = useOnlineUsers();
  const [theme, setTheme] = useState("day");
  const [stats, setStats] = useState({
    fotos: 0,
    colaboradores: 0,
    paises: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");
  // Estado para controlar el modal AboutModal
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Función para cerrar modal
  const closeAbout = () => setIsAboutOpen(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError("");
      try {
        const data = await getPublicStats();
        setStats({
          fotos: data?.photos ?? 0,
          colaboradores: data?.collaborators ?? 0,
          paises: data?.countries ?? 0,
        });
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        setStatsError(
          err?.response?.data?.message ||
            "No se pudieron cargar las estadísticas."
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const [highlighted, setHighlighted] = useState(null);
  const [slideCount, setSlideCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      } catch (error) {
        console.error("Error al cargar fotos destacadas:", error);
      }
    };

    fetchHighlighted();
  }, []);

  // Autoplay SIN hash, SIN scroll //
  useEffect(() => {
    if (!highlighted || slideCount === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [highlighted, slideCount]);

  return (
    <main className="home">
      <button onClick={goToUserPage} className="user-page-link">
        Mis Fotos
      </button>

      <button
        className="theme-toggle"
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

      <section className="fact-section" aria-labelledby="fact-title">
        <div className="fact-inner">
          <FactSection />
        </div>
      </section>

      <section className="intro-section" aria-labelledby="intro-title">
        <div className="intro-inner">
          <h2 id="intro-title" className="intro-title">
            Mosaico colaborativo en homenaje a la Sagrada Família
          </h2>

          <p className="intro-text">
            Con la finalización de la torre de Jesús, que convertirá a la
            Sagrada Familia en <strong>la iglesia más alta del mundo</strong> en
            el centenario de la muerte de Gaudí, este proyecto quiere ser
            nuestro pequeño tributo. Inspirados por el espíritu participativo de
            la ciudad de Barcelona, invitamos a todas las persona a subir sus
            propias fotos de la Basílica.
          </p>

          <p className="intro-tagline">
            Cada imagen cuenta una parte de esta historia. ¡Suma la tuya ahora!
          </p>

          <div className="intro-cta">
            {(!token || token === "null" || token === "undefined") && (
              <Link to="/email" className="btn btn-primary">
                Colabora con tu foto
              </Link>
            )}
            <Link to="/mosaic" className="btn btn-primary">
              Ver el mosaico
            </Link>
            <Link to="/gallery" className="btn btn-primary">
              Ver la galería
            </Link>
          </div>
        </div>
      </section>

      <section className="hero-preview">
        <Link to="/mosaic">
          <img
            src={heroPic}
            alt="Vista previa del mosaico colaborativo de la Sagrada Família"
            loading="lazy"
            className="hero-clickable"
          />
        </Link>
      </section>

      <MosaicProgressBar totalPhotos={stats.fotos} />

      <section className="stats-section">
        <h3 className="stats-title">Nuestra comunidad en cifras</h3>
        {statsError && (
          <p className="text-red-600 text-sm mb-2">{statsError}</p>
        )}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">
              {loadingStats ? "..." : stats.fotos.toLocaleString()}
            </span>
            <span className="stat-label">Fotos subidas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {loadingStats ? "..." : stats.colaboradores.toLocaleString()}
            </span>
            <span className="stat-label">Colaboradores</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {loadingStats ? "..." : stats.paises}
            </span>
            <span className="stat-label">Países participantes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{onlineTotal || 0}</span>
            <span className="stat-label">Personas viendo ahora</span>
          </div>
        </div>
      </section>

      <section className="carousel-section">
        <h3 className="section-title">
          Mira las fotos más destacadas del mosaico
        </h3>

        {!highlighted ? (
          <p>Cargando...</p>
        ) : (
          (() => {
            const rawSlides = [
              {
                title: "La más antigua",
                description: `Capturada en ${
                  highlighted.oldestByYear?.year || "año desconocido"
                }.`,
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
            ].filter((s) => !!s.src);

            return (
              <div className="w-full max-w-3xl mx-auto rounded-lg shadow-lg overflow-hidden relative">
                <div className="relative w-full h-[500px] flex items-center justify-center bg-black/5">
                  <img
                    src={rawSlides[currentSlide].src}
                    alt={rawSlides[currentSlide].title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-4">
                    <h3 className="text-lg font-semibold">
                      {rawSlides[currentSlide].title}
                    </h3>
                    <p>{rawSlides[currentSlide].description}</p>
                  </div>

                  <button
                    onClick={() =>
                      setCurrentSlide(
                        (currentSlide - 1 + rawSlides.length) % rawSlides.length
                      )
                    }
                    className="btn btn-circle absolute left-5 top-1/2 -translate-y-1/2"
                  >
                    ❮
                  </button>

                  <button
                    onClick={() =>
                      setCurrentSlide((currentSlide + 1) % rawSlides.length)
                    }
                    className="btn btn-circle absolute right-5 top-1/2 -translate-y-1/2"
                  >
                    ❯
                  </button>
                </div>

                <div className="flex justify-center gap-3 py-4 bg-base-100">
                  {rawSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`carousel-dot ${
                        i === currentSlide ? "is-active" : ""
                      }`}
                      type="button"
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </section>

      <footer className="footer">
        <p className="footer-text">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="footer-link"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "white",
            }}
            aria-label="Abrir información sobre el proyecto"
          >
            Sobre el proyecto
          </button>
          <a href="/api/docs">API Docs</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </footer>

      <LiveCamera />

      <AboutModal isOpen={isAboutOpen} onClose={closeAbout} />
    </main>
  );
}
