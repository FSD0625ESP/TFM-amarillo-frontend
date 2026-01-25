import React, { useState, useEffect } from "react";
import ReactFlagsSelect from "react-flags-select";
import { Link } from "react-router-dom";
import { formatCountry } from "../countryUtils";
import {
  getPhotoCountries,
  getPhotoYears,
  getPhotos,
  likePhoto,
} from "../services/photoService";
import "./Gallery.css"; // Crearemos este CSS después

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [years, setYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likingId, setLikingId] = useState(null);
  const [likeNotice, setLikeNotice] = useState("");

  // 🔹 Estado de los filtros
  const [filters, setFilters] = useState({
    country: "",
    year: "",
    sortBy: "newest",
  });

  // Cargar fotos cada vez que cambien los filtros
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getPhotos(filters);
        setPhotos(data);
      } catch (error) {
        console.error("Error cargando galería:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters]);

  useEffect(() => {
    async function loadCountries() {
      setLoadingCountries(true);
      try {
        const data = await getPhotoCountries();
        setCountries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando países:", error);
        setCountries([]);
      } finally {
        setLoadingCountries(false);
      }
    }
    loadCountries();
  }, []);

  useEffect(() => {
    async function loadYears() {
      setLoadingYears(true);
      try {
        const data = await getPhotoYears();
        setYears(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando años:", error);
        setYears([]);
      } finally {
        setLoadingYears(false);
      }
    }
    loadYears();
  }, []);

  // Manejar cambios en los inputs
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const selectedIndex = selectedPhoto
    ? photos.findIndex((photo) => photo._id === selectedPhoto._id)
    : -1;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < photos.length - 1;
  const goPrev = () => {
    if (hasPrev) setSelectedPhoto(photos[selectedIndex - 1]);
  };
  const goNext = () => {
    if (hasNext) setSelectedPhoto(photos[selectedIndex + 1]);
  };

  const handleLike = async (photoId) => {
    const token = getStoredUserToken();
    if (!token) {
      setLikeNotice("Debes estar registrado para dar like.");
      return;
    }

    setLikeNotice("");
    setLikingId(photoId);
    try {
      const result = await likePhoto(photoId);
      const updatedLikes =
        typeof result?.likes === "number" ? result.likes : undefined;

      if (typeof updatedLikes === "number") {
        setPhotos((prev) =>
          prev.map((photo) =>
            photo._id === photoId
              ? { ...photo, likes: updatedLikes }
              : photo
          )
        );
        setSelectedPhoto((prev) =>
          prev && prev._id === photoId
            ? { ...prev, likes: updatedLikes }
            : prev
        );
      }
    } catch (error) {
      console.error("Error al dar like:", error);
      if (error?.response?.status === 401) {
        setLikeNotice("Debes estar registrado para dar like.");
      }
    } finally {
      setLikingId(null);
    }
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <div>
          <h1>Galería de la Comunidad</h1>
          <p className="gallery-subtitle">
            Historias y miradas compartidas desde todo el mundo.
          </p>
        </div>
        <div className="gallery-actions">
          <Link to="/" className="btn btn-primary">
            Volver a Home
          </Link>
          <Link to="/mosaic" className="btn btn-primary">
            Ver el mosaico
          </Link>
        </div>
      </div>

      {/* 🛠 BARRA DE HERRAMIENTAS */}
      <div className="filters-bar">
        {/* Filtro País */}
        <div className="flag-select-wrapper">
          <ReactFlagsSelect
            searchable
            selected={filters.country}
            countries={countries}
            onSelect={(code) => setFilters({ ...filters, country: code })}
            placeholder="Todos los países 🌍"
            disabled={loadingCountries}
          />
        </div>
        <button
          type="button"
          className="clear-country"
          onClick={() => setFilters({ ...filters, country: "" })}
          disabled={!filters.country}
        >
          Todos
        </button>

        {/* Filtro Año */}
        <select
          name="year"
          onChange={handleFilterChange}
          value={filters.year}
          disabled={loadingYears}
        >
          <option value="">Todos los años 📅</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Ordenamiento */}
        <div className="sort-buttons">
          <button
            className={filters.sortBy === "newest" ? "active" : ""}
            onClick={() => setFilters({ ...filters, sortBy: "newest" })}
          >
            Más Recientes
          </button>
          <button
            className={filters.sortBy === "likes" ? "active" : ""}
            onClick={() => setFilters({ ...filters, sortBy: "likes" })}
          >
            Más Populares ❤️
          </button>
        </div>
      </div>

      {/* 📸 GRID DE FOTOS */}
      {likeNotice ? (
        <div className="gallery-notice" role="status">
          <span className="notice-icon" aria-hidden="true">
            🔒
          </span>
          <span>{likeNotice}</span>
        </div>
      ) : null}
      {loading ? (
        <p>Cargando fotos...</p>
      ) : (
        <div className="photo-grid">
          {photos.length > 0 ? (
            photos.map((photo) => (
              <div
                key={photo._id}
                className="photo-card"
                onClick={() => setSelectedPhoto(photo)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedPhoto(photo);
                  }
                }}
              >
                <div className="image-wrapper">
                  <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
                </div>
                <div className="photo-info">
                  <h3 className="photo-title">{photo.title}</h3>
                  <p className="photo-story">
                    {photo.description || photo.owner?.story || ""}
                  </p>
                  <div className="photo-footer">
                    <div className="meta-tags">
                    {photo.country && (
                      <span className="tag-country">
                        📍 {formatCountry(photo.country) || photo.country}
                      </span>
                    )}
                      <span className="tag-year">📅 {photo.year || "N/A"}</span>
                    </div>
                    <div className="likes-section">
                      <button
                        type="button"
                        className="like-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleLike(photo._id);
                        }}
                        disabled={likingId === photo._id}
                      >
                        ❤️ {photo.likes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">
              No encontramos fotos con esos filtros 😢
            </p>
          )}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="photo-modal"
          onClick={() => setSelectedPhoto(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSelectedPhoto(null);
            }
            if (event.key === "ArrowLeft") {
              goPrev();
            }
            if (event.key === "ArrowRight") {
              goNext();
            }
          }}
        >
          <div
            className="photo-modal-content"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="photo-modal-close"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <button
              type="button"
              className="photo-modal-nav prev"
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="photo-modal-nav next"
              onClick={goNext}
              disabled={!hasNext}
              aria-label="Siguiente"
            >
              ›
            </button>
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title}
              className="photo-modal-image"
            />
            <div className="photo-modal-info">
              <h3>{selectedPhoto.title}</h3>
              <p>{selectedPhoto.description || selectedPhoto.owner?.story || ""}</p>
              {likeNotice ? (
                <div className="gallery-notice modal" role="status">
                  <span className="notice-icon" aria-hidden="true">
                    🔒
                  </span>
                  <span>{likeNotice}</span>
                </div>
              ) : null}
              <div className="meta-tags">
                {selectedPhoto.country && (
                  <span className="tag-country">
                    📍{" "}
                    {formatCountry(selectedPhoto.country) ||
                      selectedPhoto.country}
                  </span>
                )}
                <span className="tag-year">
                  📅 {selectedPhoto.year || "N/A"}
                </span>
              </div>
              <div className="likes-section">
                <button
                  type="button"
                  className="like-button"
                  onClick={() => handleLike(selectedPhoto._id)}
                  disabled={likingId === selectedPhoto._id}
                >
                  ❤️ {selectedPhoto.likes || 0}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStoredUserToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken");
}
