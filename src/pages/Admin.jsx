import React, { useState, useEffect, useCallback } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import PhotoGrid from "../components/admin/PhotoGrid";
import FactList from "../components/admin/FactList.jsx";
import UserList from "../components/admin/UserList";
import StatsPanel from "../components/admin/StatsPanel";
import "./Admin.css";
import axios from "axios";
import useOnlineUsers from "../hooks/useOnlineUsers";
import ReactFlagsSelect from "react-flags-select";
import { formatCountry } from "../countryUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Admin() {
  const [photos, setPhotos] = useState([]);
  const [activeSection, setActiveSection] = useState("home");
  const [adminName, setAdminName] = useState("Admin");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPhotos, setUserPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [focusedUser, setFocusedUser] = useState(null);
  const [usersByEmail, setUsersByEmail] = useState({});
  const [loadingAllPhotos, setLoadingAllPhotos] = useState(true);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [togglingPhotoId, setTogglingPhotoId] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    year: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const { count: onlineCount, users: onlineUsers } = useOnlineUsers();
  const getPhotoId = (photo) => photo?._id || photo?.id;
  const [editingCountry, setEditingCountry] = useState(false);
  const [countryDraft, setCountryDraft] = useState("");
  const [savingCountry, setSavingCountry] = useState(false);
  const [mosaicKey, setMosaicKey] = useState("default");
  const [mosaicWidth, setMosaicWidth] = useState(2000);
  const [mosaicHeight, setMosaicHeight] = useState(2000);
  const [useAutoRatio, setUseAutoRatio] = useState(false);
  const [mainImageAspect, setMainImageAspect] = useState(null);
  const [mosaicBusy, setMosaicBusy] = useState(false);
  const [allowReuse, setAllowReuse] = useState(true);
  const [mosaicError, setMosaicError] = useState("");
  const [mosaicSnapshot, setMosaicSnapshot] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [tileWidth, setTileWidth] = useState(20);
  const [tileHeight, setTileHeight] = useState(20);
  const [generatingTiles, setGeneratingTiles] = useState(false);
  const [tilesCount, setTilesCount] = useState(null);
  const [mosaicSnapshots, setMosaicSnapshots] = useState([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [snapshotsError, setSnapshotsError] = useState("");
  const [snapshotToDelete, setSnapshotToDelete] = useState(null);
  const [deletingSnapshotId, setDeletingSnapshotId] = useState(null);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [savingAuto, setSavingAuto] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [intervalHours, setIntervalHours] = useState(24);
  const [refreshSeconds, setRefreshSeconds] = useState(30);

  const handleSaveCountry = async () => {
    if (!selectedUser?.id || !countryDraft) return;
    setSavingCountry(true);
    try {
      const res = await axios.put(`${API_URL}/emails/${selectedUser.id}`, {
        country: countryDraft,
      });
      const updated = res.data?.user;
      const normalizedCountry =
        updated?.country?.toString().trim().toUpperCase() || countryDraft;

      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              country: normalizedCountry,
            }
          : prev
      );

      if (updated?.email) {
        setUsersByEmail((prev) => ({
          ...prev,
          [updated.email.toLowerCase()]: {
            ...(prev[updated.email.toLowerCase()] || {}),
            ...updated,
          },
        }));
      }
      setEditingCountry(false);
    } catch (error) {
      console.error("Error actualizando país:", error);
      alert(
        error.response?.data?.message ||
          "No se pudo actualizar el país. Intenta nuevamente."
      );
    } finally {
      setSavingCountry(false);
    }
  };

  const applyPhotoUpdate = (updatedPhoto) => {
    const updatedId = getPhotoId(updatedPhoto);
    setPhotos((prev) =>
      prev.map((photo) =>
        getPhotoId(photo) === updatedId ? updatedPhoto : photo
      )
    );
    setUserPhotos((prev) =>
      prev.map((photo) =>
        getPhotoId(photo) === updatedId ? updatedPhoto : photo
      )
    );
  };

  const removePhotoFromState = (photoId) => {
    setPhotos((prev) => prev.filter((photo) => getPhotoId(photo) !== photoId));
    setUserPhotos((prev) =>
      prev.filter((photo) => getPhotoId(photo) !== photoId)
    );
  };
  const fetchAllPhotos = useCallback(async () => {
    setLoadingAllPhotos(true);
    try {
      const res = await axios.get(`${API_URL}/photos/all`);
      setPhotos(res.data || []);
    } catch (err) {
      console.error("Error obteniendo todas las fotos:", err);
    } finally {
      setLoadingAllPhotos(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAllPhotos();
  }, [fetchAllPhotos]);

  useEffect(() => {
    const fetchUsersIndex = async () => {
      try {
        const res = await axios.get(`${API_URL}/emails`);
        const map = {};
        (res.data || []).forEach((user) => {
          if (user?.email) {
            map[user.email.toLowerCase()] = user;
          }
        });
        setUsersByEmail(map);
      } catch (err) {
        console.error("Error construyendo índice de usuarios:", err);
      }
    };

    fetchUsersIndex();
  }, [API_URL]);
  useEffect(() => {
    const storedName = localStorage.getItem("adminName");
    if (storedName && storedName.trim() !== "") {
      setAdminName(storedName);
    } else {
      setAdminName("Admin");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!mainImageUrl) {
      setMainImageAspect(null);
      return undefined;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      if (img.naturalWidth > 0) {
        setMainImageAspect(img.naturalHeight / img.naturalWidth);
      } else {
        setMainImageAspect(null);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setMainImageAspect(null);
      }
    };
    img.src = mainImageUrl;

    return () => {
      cancelled = true;
    };
  }, [mainImageUrl]);

  const resolveMosaicDimensions = () => {
    const width = Number(mosaicWidth);
    const height = Number(mosaicHeight);
    const safeWidth = Number.isFinite(width) && width > 0 ? width : 2000;
    const safeHeight =
      Number.isFinite(height) && height > 0 ? height : safeWidth;
    const autoHeight =
      useAutoRatio && Number.isFinite(mainImageAspect)
        ? Math.max(1, Math.round(safeWidth * mainImageAspect))
        : safeHeight;
    return { width: safeWidth, height: autoHeight, baseHeight: safeHeight };
  };

  const handleViewPhotos = (userPayload) => {
    const id = userPayload?._id || userPayload?.id;
    const email = userPayload?.email;
    if (!id) return;

    const userFromIndex =
      (email && usersByEmail[email.toLowerCase()]) || null;

    const countryCode =
      (userPayload?.country || userFromIndex?.country || "")
        .toString()
        .trim()
        .toUpperCase();

    setSelectedUser({
      id,
      email: userFromIndex?.email || email,
      name: userPayload?.name || userFromIndex?.name,
      age: userPayload?.age || userFromIndex?.age,
      country: countryCode || null,
    });
    setCountryDraft(countryCode || "");
    setEditingCountry(false);
    setSavingCountry(false);

    fetchUserPhotos(id);
    setActiveSection("fotos");
  };

  const fetchUserPhotos = async (userId) => {
    setLoadingPhotos(true);
    try {
      const res = await axios.get(`${API_URL}/emails/${userId}/photos`);
      setUserPhotos(res.data.photos || []);
    } catch (err) {
      console.error("Error obteniendo fotos del usuario:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleShowAllPhotos = () => {
    setSelectedUser(null);
    setUserPhotos([]);
    setActiveSection("fotos");
    fetchAllPhotos();
  };

  const handlePhotoOwnerClick = (photoData) => {
    if (!photoData) return;
    const owner = photoData.owner;
    const ownerEmail =
      owner?.email ||
      photoData.ownerEmail ||
      photoData.email ||
      (typeof owner === "string" && owner.includes("@") ? owner : null);

    const ownerIdCandidates = [
      owner?._id,
      owner?.id,
      photoData.ownerId,
      photoData.userId,
      typeof owner === "string" && !owner.includes("@") ? owner : null,
    ].filter(Boolean);

    let resolvedOwnerId = ownerIdCandidates[0];
    if (!resolvedOwnerId && ownerEmail) {
      const matchedUser = usersByEmail[ownerEmail.toLowerCase()];
      resolvedOwnerId = matchedUser?._id || matchedUser?.id;
    }

    if (resolvedOwnerId) {
      handleViewPhotos({ id: resolvedOwnerId, email: ownerEmail });
      return;
    }

    if (ownerEmail) {
      setFocusedUser({ email: ownerEmail, trigger: Date.now() });
      setActiveSection("usuarios");
      setTimeout(() => {
        document
          .getElementById("usuarios")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      console.warn("No se pudo determinar el usuario de la foto seleccionada.");
    }
  };

  const requestDeletePhoto = (photo) => {
    if (!photo) return;
    setPhotoToDelete(photo);
  };

  const handleConfirmDeletePhoto = async () => {
    const photoId = getPhotoId(photoToDelete);
    if (!photoId) return;
    setDeletingPhotoId(photoId);
    try {
      await axios.delete(`${API_URL}/photos/${photoId}`);
      removePhotoFromState(photoId);
      setPhotoToDelete(null);
    } catch (err) {
      console.error("Error eliminando foto:", err);
      alert("No se pudo eliminar la foto. Intenta nuevamente.");
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleTogglePhotoVisibility = async (photo) => {
    const photoId = getPhotoId(photo);
    if (!photoId) return;
    setTogglingPhotoId(photoId);
    try {
      const { data } = await axios.put(`${API_URL}/photos/${photoId}`, {
        hidden: !photo.hidden,
      });
      applyPhotoUpdate(data);
    } catch (err) {
      console.error("Error cambiando visibilidad:", err);
      alert(
        err.response?.data?.message ||
          "No se pudo actualizar la visibilidad de la foto."
      );
    } finally {
      setTogglingPhotoId(null);
    }
  };

  const openEditModal = (photo) => {
    setEditingPhoto(photo);
    setEditForm({
      title: photo.title || "",
      description: photo.description || "",
      year: photo.year ? String(photo.year) : "",
    });
    setEditError("");
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingPhoto(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePhotoEdit = async (e) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const trimmedTitle = editForm.title.trim();
    if (!trimmedTitle) {
      setEditError("El título es obligatorio.");
      return;
    }

    if (editForm.year && Number.isNaN(Number(editForm.year))) {
      setEditError("El año debe ser un número válido.");
      return;
    }

    setSavingEdit(true);
    setEditError("");
    try {
      const payload = {
        title: trimmedTitle,
        description: (editForm.description ?? "").trim(),
        year: editForm.year === "" ? null : Number(editForm.year),
      };

      const photoId = getPhotoId(editingPhoto);
      const { data } = await axios.put(`${API_URL}/photos/${photoId}`, payload);

      applyPhotoUpdate(data);
      setEditingPhoto(null);
    } catch (err) {
      console.error("Error editando foto:", err);
      setEditError(
        err.response?.data?.message || "No se pudo guardar los cambios."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    window.location.href = "/adminlogin";
  };

  const handleGenerateMosaic = async () => {
    if (!mosaicKey.trim()) {
      setMosaicError("Debes indicar un mosaicKey.");
      return;
    }
    if (useAutoRatio && !mainImageUrl) {
      setMosaicError("Para usar auto ratio, sube una imagen principal.");
      return;
    }
    setMosaicBusy(true);
    setMosaicError("");
    setMosaicSnapshot(null);
    try {
      const { width: outputWidth, height: outputHeight } =
        resolveMosaicDimensions();
      if (useAutoRatio && !Number.isFinite(mainImageAspect)) {
        setMosaicError(
          "No se pudo leer el tamaño de la imagen principal para el auto ratio."
        );
        return;
      }
      const tilesCheck = await axios.get(
        `${API_URL}/mosaic/tiles?mosaicKey=${encodeURIComponent(
          mosaicKey.trim()
        )}`
      );
      const count = Array.isArray(tilesCheck.data) ? tilesCheck.data.length : 0;
      setTilesCount(count);
      if (count === 0) {
        setMosaicError(
          "No hay tiles para ese mosaicKey. Genera tiles antes."
        );
        return;
      }
      await axios.post(`${API_URL}/mosaic/tiles/match`, {
        mosaicKey: mosaicKey.trim(),
        allowReuse,
      });
      const { data } = await axios.post(`${API_URL}/mosaic/render`, {
        mosaicKey: mosaicKey.trim(),
        outputWidth,
        outputHeight,
        folder: "Mosaic",
        format: "jpg",
      });
      setMosaicSnapshot(data?.snapshot || null);
      fetchMosaicSnapshots();
    } catch (err) {
      console.error("Error generando mosaico:", err);
      setMosaicError(
        err.response?.data?.message || "No se pudo generar el mosaico."
      );
    } finally {
      setMosaicBusy(false);
    }
  };

  const fetchMosaicConfig = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/mosaic/config`);
      if (!data) return;
      setAutoEnabled(Boolean(data.enabled));
      if (data.mainImageUrl) setMainImageUrl(data.mainImageUrl);
      if (data.tileWidth) setTileWidth(data.tileWidth);
      if (data.tileHeight) setTileHeight(data.tileHeight);
      if (data.mosaicKey) setMosaicKey(data.mosaicKey);
      if (data.mosaicWidth || data.outputWidth) {
        setMosaicWidth(data.mosaicWidth || data.outputWidth);
      } else if (data.mosaicSize) {
        setMosaicWidth(data.mosaicSize);
      }
      if (data.mosaicHeight || data.outputHeight) {
        setMosaicHeight(data.mosaicHeight || data.outputHeight);
      } else if (data.mosaicSize) {
        setMosaicHeight(data.mosaicSize);
      }
      if (data.intervalHours) setIntervalHours(data.intervalHours);
      if (typeof data.useAutoRatio === "boolean") {
        setUseAutoRatio(data.useAutoRatio);
      }
      if (data.refreshSeconds !== undefined && data.refreshSeconds !== null) {
        const parsedRefresh = Number(data.refreshSeconds);
        if (Number.isFinite(parsedRefresh) && parsedRefresh >= 0) {
          setRefreshSeconds(parsedRefresh);
        }
      }
      if (typeof data.allowReuse === "boolean") {
        setAllowReuse(data.allowReuse);
      }
      setConfigLoaded(true);
    } catch (err) {
      console.error("Error cargando config de mosaico:", err);
    }
  }, [API_URL]);

  const handleGenerateTiles = async () => {
    if (!mainImageUrl) {
      setMosaicError("Primero sube una imagen principal.");
      return;
    }
    setGeneratingTiles(true);
    setMosaicError("");
    try {
      await axios.post(`${API_URL}/mosaic/tiles/generate`, {
        mainImageUrl,
        tileWidth: Number(tileWidth) || 20,
        tileHeight: Number(tileHeight) || 20,
        mosaicKey: mosaicKey.trim() || "default",
        overwrite: true,
      });
      const tilesCheck = await axios.get(
        `${API_URL}/mosaic/tiles?mosaicKey=${encodeURIComponent(
          mosaicKey.trim() || "default"
        )}`
      );
      setTilesCount(
        Array.isArray(tilesCheck.data) ? tilesCheck.data.length : 0
      );
    } catch (err) {
      console.error("Error generando tiles:", err);
      setMosaicError(
        err.response?.data?.message || "No se pudo generar los tiles."
      );
    } finally {
      setGeneratingTiles(false);
    }
  };

  const handleUploadMainImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingMainImage(true);
    setMosaicError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "Mosaic");
      const { data } = await axios.post(`${API_URL}/mosaic/main-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const nextUrl = data?.url || "";
      setMainImageUrl(nextUrl);
      if (autoEnabled) {
        const { width, height } = resolveMosaicDimensions();
        await axios.put(`${API_URL}/mosaic/config`, {
          enabled: true,
          mainImageUrl: nextUrl,
          tileWidth: Number(tileWidth) || 20,
          tileHeight: Number(tileHeight) || 20,
          mosaicKey: mosaicKey.trim() || "default",
          mosaicWidth: width,
          mosaicHeight: height,
          mosaicSize: width,
          useAutoRatio,
          allowReuse,
          intervalHours: Number(intervalHours) || 24,
          refreshSeconds: Number.isFinite(Number(refreshSeconds))
            ? Number(refreshSeconds)
            : 30,
        });
      }
    } catch (err) {
      console.error("Error subiendo imagen principal:", err);
      setMosaicError(
        err.response?.data?.message ||
          "No se pudo subir la imagen principal."
      );
    } finally {
      setUploadingMainImage(false);
    }
  };

  const handleToggleAuto = async (nextEnabled) => {
    if (nextEnabled && !mainImageUrl) {
      setMosaicError("Primero sube una imagen principal para activar el modo automático.");
      return;
    }
    setSavingAuto(true);
    setMosaicError("");
    try {
      const { width, height } = resolveMosaicDimensions();
      if (useAutoRatio && !Number.isFinite(mainImageAspect)) {
        setMosaicError(
          "No se pudo leer el tamaño de la imagen principal para el auto ratio."
        );
        return;
      }
      const { data } = await axios.put(`${API_URL}/mosaic/config`, {
        enabled: nextEnabled,
        mainImageUrl,
        tileWidth: Number(tileWidth) || 20,
        tileHeight: Number(tileHeight) || 20,
        mosaicKey: mosaicKey.trim() || "default",
        mosaicWidth: width,
        mosaicHeight: height,
        mosaicSize: width,
        useAutoRatio,
        allowReuse,
        intervalHours: Number(intervalHours) || 24,
        refreshSeconds: Number.isFinite(Number(refreshSeconds))
          ? Number(refreshSeconds)
          : 30,
      });
      setAutoEnabled(Boolean(data?.enabled));
      setConfigLoaded(true);
    } catch (err) {
      console.error("Error actualizando modo automático:", err);
      setMosaicError(
        err.response?.data?.message ||
          "No se pudo actualizar el modo automático."
      );
    } finally {
      setSavingAuto(false);
    }
  };

  const handleSaveAutoConfig = async () => {
    if (!mainImageUrl) {
      setMosaicError("Primero sube una imagen principal para guardar la config.");
      return;
    }
    setSavingConfig(true);
    setMosaicError("");
    try {
      const { width, height } = resolveMosaicDimensions();
      if (useAutoRatio && !Number.isFinite(mainImageAspect)) {
        setMosaicError(
          "No se pudo leer el tamaño de la imagen principal para el auto ratio."
        );
        return;
      }
      const { data } = await axios.put(`${API_URL}/mosaic/config`, {
        enabled: autoEnabled,
        mainImageUrl,
        tileWidth: Number(tileWidth) || 20,
        tileHeight: Number(tileHeight) || 20,
        mosaicKey: mosaicKey.trim() || "default",
        mosaicWidth: width,
        mosaicHeight: height,
        mosaicSize: width,
        useAutoRatio,
        allowReuse,
        intervalHours: Number(intervalHours) || 24,
        refreshSeconds: Number.isFinite(Number(refreshSeconds))
          ? Number(refreshSeconds)
          : 30,
      });
      setAutoEnabled(Boolean(data?.enabled));
      setConfigLoaded(true);
    } catch (err) {
      console.error("Error guardando config automática:", err);
      setMosaicError(
        err.response?.data?.message || "No se pudo guardar la configuración."
      );
    } finally {
      setSavingConfig(false);
    }
  };

  const handleOpenSnapshot = (snapshotUrl) => {
    if (!snapshotUrl) return;
    window.open(snapshotUrl, "_blank", "noopener,noreferrer");
  };

  const handleConfirmDeleteSnapshot = async () => {
    if (!snapshotToDelete?._id) return;
    setDeletingSnapshotId(snapshotToDelete._id);
    try {
      await axios.delete(
        `${API_URL}/mosaic/snapshots/${snapshotToDelete._id}`
      );
      setMosaicSnapshots((prev) =>
        prev.filter((snapshot) => snapshot._id !== snapshotToDelete._id)
      );
      setSnapshotToDelete(null);
    } catch (err) {
      console.error("Error eliminando mosaico:", err);
      setSnapshotsError(
        err.response?.data?.message || "No se pudo eliminar el mosaico."
      );
    } finally {
      setDeletingSnapshotId(null);
    }
  };

  const fetchMosaicSnapshots = useCallback(async () => {
    setLoadingSnapshots(true);
    setSnapshotsError("");
    try {
      const { data } = await axios.get(`${API_URL}/mosaic/snapshots`);
      setMosaicSnapshots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error obteniendo mosaicos:", err);
      setSnapshotsError(
        err.response?.data?.message || "No se pudo cargar los mosaicos."
      );
    } finally {
      setLoadingSnapshots(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMosaicSnapshots();
  }, [fetchMosaicSnapshots]);

  useEffect(() => {
    fetchMosaicConfig();
  }, [fetchMosaicConfig]);

  const { height: resolvedHeight } = resolveMosaicDimensions();

  return (
    <div data-theme="light" className="drawer drawer-open admin-layout">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="p-6">
          {activeSection === "home" && (
            <>
              <h1 className="text-2xl font-bold mb-4">
                Bienvenido, {adminName}
              </h1>
              <p className="text-gray-600 mb-3">
                Desde este panel puedes gestionar fotos, usuarios, facts y ver
                estadísticas.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">
                  Usuarios online ahora:
                </span>
                <span className="badge badge-success badge-outline">
                  {onlineCount}
                </span>
                {onlineUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {onlineUsers.slice(0, 5).map((u, idx) => (
                      <span key={u.id || u.email || idx} className="badge badge-neutral">
                        {u.email || u.id}
                      </span>
                    ))}
                    {onlineUsers.length > 5 && (
                      <span className="badge badge-ghost">
                        +{onlineUsers.length - 5} más
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 mosaic-admin-card">
                <div className="mosaic-header">
                  <div>
                    <h2>Generar mosaico</h2>
                    <p className="mosaic-subtitle">
                      Sube la imagen principal, define los tiles y genera el
                      mosaico final.
                    </p>
                  </div>
                  {tilesCount !== null && (
                    <span className="mosaic-pill">
                      Tiles: {tilesCount}
                    </span>
                  )}
                </div>

                <div className="mosaic-upload">
                  <label>
                    Imagen principal (se sube a Cloudinary)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadMainImage}
                      className="file-input file-input-bordered file-input-sm"
                      disabled={uploadingMainImage}
                    />
                  </label>
                  {mainImageUrl && (
                    <div className="mosaic-link">
                      <span>URL:</span>
                      <a
                        href={mainImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {mainImageUrl}
                      </a>
                    </div>
                  )}
                  {mainImageUrl && (
                    <div className="mosaic-preview">
                      <span className="mosaic-preview-label">
                        Imagen principal activa
                      </span>
                      <div className="mosaic-preview-card">
                        <img src={mainImageUrl} alt="Imagen principal" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mosaic-grid">
                  <label>
                    <span
                      className="mosaic-tooltip"
                      data-tooltip="Ancho de cada tile (cuadradito) en píxeles. Ej: 20 = 20px."
                    >
                      Tile width (px)
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={tileWidth}
                      onChange={(e) => setTileWidth(e.target.value)}
                      className="input input-bordered input-sm"
                    />
                  </label>
                  <label>
                    <span
                      className="mosaic-tooltip"
                      data-tooltip="Alto de cada tile en píxeles. Ej: 20 = 20px."
                    >
                      Tile height (px)
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={tileHeight}
                      onChange={(e) => setTileHeight(e.target.value)}
                      className="input input-bordered input-sm"
                    />
                  </label>
                  <label>
                    <span
                      className="mosaic-tooltip"
                      data-tooltip="Identificador del mosaico. Sirve para separar mosaicos distintos."
                    >
                      mosaicKey
                    </span>
                    <input
                      type="text"
                      value={mosaicKey}
                      onChange={(e) => setMosaicKey(e.target.value)}
                      className="input input-bordered input-sm"
                      placeholder="default"
                    />
                  </label>
                  <label>
                    <span
                      className="mosaic-tooltip"
                      data-tooltip="Ancho final de la imagen del mosaico."
                    >
                      Ancho (px)
                    </span>
                    <input
                      type="number"
                      min="200"
                      step="100"
                      value={mosaicWidth}
                      onChange={(e) => setMosaicWidth(e.target.value)}
                      className="input input-bordered input-sm"
                    />
                  </label>
                  <label>
                    <span
                      className="mosaic-tooltip"
                      data-tooltip={
                        useAutoRatio
                          ? "Se calcula automáticamente con la imagen principal."
                          : "Alto final de la imagen del mosaico."
                      }
                    >
                      Alto (px)
                    </span>
                    <input
                      type="number"
                      min="200"
                      step="100"
                      value={useAutoRatio ? resolvedHeight : mosaicHeight}
                      onChange={(e) => setMosaicHeight(e.target.value)}
                      className="input input-bordered input-sm"
                      disabled={useAutoRatio}
                    />
                  </label>
                </div>

                <div className="mosaic-actions">
                  <div className="mosaic-checkboxes">
                    <label className="mosaic-checkbox">
                      <input
                        type="checkbox"
                        checked={useAutoRatio}
                        onChange={(e) => setUseAutoRatio(e.target.checked)}
                        className="checkbox checkbox-sm"
                      />
                      <span
                        className="mosaic-tooltip"
                        data-tooltip="Calcula el alto usando la proporción de la imagen principal."
                      >
                        Auto ratio
                      </span>
                    </label>
                    <label className="mosaic-checkbox">
                      <input
                        type="checkbox"
                        checked={allowReuse}
                        onChange={(e) => setAllowReuse(e.target.checked)}
                        className="checkbox checkbox-sm"
                      />
                      Reutilizar fotos
                    </label>
                    <label className="mosaic-checkbox">
                      <input
                        type="checkbox"
                        checked={autoEnabled}
                        onChange={(e) => handleToggleAuto(e.target.checked)}
                        className="checkbox checkbox-sm"
                        disabled={savingAuto}
                      />
                      Modo automático
                    </label>
                    <label className="mosaic-inline-field">
                      <span
                        className="mosaic-inline-label mosaic-tooltip"
                        data-tooltip="Cada cuántas horas se genera automáticamente un mosaico en el backend."
                      >
                        Intervalo (h)
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={intervalHours}
                        onChange={(e) => setIntervalHours(e.target.value)}
                        className="input input-bordered input-xs"
                      />
                    </label>
                    <label className="mosaic-inline-field">
                      <span
                        className="mosaic-inline-label mosaic-tooltip"
                        data-tooltip="Intervalo en segundos para refrescar el mosaico en la página pública. 0 = desactivar."
                      >
                        Refresco (s)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={refreshSeconds}
                        onChange={(e) => setRefreshSeconds(e.target.value)}
                        className="input input-bordered input-xs"
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={handleSaveAutoConfig}
                      disabled={savingConfig}
                    >
                      {savingConfig ? "Guardando..." : "Guardar config"}
                    </button>
                  </div>
                  <div className="mosaic-buttons">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleGenerateTiles}
                      disabled={generatingTiles}
                    >
                      {generatingTiles ? "Generando..." : "Generar tiles"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleGenerateMosaic}
                      disabled={mosaicBusy}
                    >
                      {mosaicBusy ? "Generando..." : "Generar mosaico"}
                    </button>
                  </div>
                </div>

                {mosaicError && (
                  <p className="mosaic-error-text">{mosaicError}</p>
                )}
                {mosaicSnapshot?.url && (
                  <p className="mosaic-success-text">
                    Mosaico generado:{" "}
                    <a
                      href={mosaicSnapshot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver imagen
                    </a>
                  </p>
                )}
              </div>

              <div className="mt-6 mosaic-admin-card">
                <div className="mosaic-header">
                  <div>
                    <h2>Mosaicos generados</h2>
                    <p className="mosaic-subtitle">
                      Histórico de mosaicos renderizados.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={fetchMosaicSnapshots}
                    disabled={loadingSnapshots}
                  >
                    {loadingSnapshots ? "Actualizando..." : "Actualizar"}
                  </button>
                </div>

                {snapshotsError && (
                  <p className="mosaic-error-text">{snapshotsError}</p>
                )}

                {loadingSnapshots ? (
                  <p className="mosaic-empty">Cargando mosaicos...</p>
                ) : mosaicSnapshots.length === 0 ? (
                  <p className="mosaic-empty">
                    Todavía no hay mosaicos generados.
                  </p>
                ) : (
                  <div className="mosaic-snapshots">
                    {mosaicSnapshots.map((snapshot) => {
                      const snapshotKey =
                        snapshot._id || snapshot.publicId || snapshot.url;
                      const snapshotUrl = snapshot.url || "";
                      const snapshotDate = snapshot.createdAt
                        ? new Date(snapshot.createdAt).toLocaleString("es-ES")
                        : null;
                      const canDelete = Boolean(snapshot._id);
                      return (
                        <article
                          key={snapshotKey}
                          className={`mosaic-snapshot-card ${
                            snapshotUrl ? "mosaic-snapshot-link" : ""
                          }`}
                          role={snapshotUrl ? "button" : undefined}
                          tabIndex={snapshotUrl ? 0 : -1}
                          onClick={() => handleOpenSnapshot(snapshotUrl)}
                          onKeyDown={(event) => {
                            if (!snapshotUrl) return;
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleOpenSnapshot(snapshotUrl);
                            }
                          }}
                        >
                          <div className="mosaic-snapshot-image">
                            {snapshotUrl ? (
                              <img
                                src={snapshotUrl}
                                alt={snapshot.mosaicKey || "Mosaico"}
                              />
                            ) : (
                              <div className="mosaic-snapshot-placeholder">
                                Sin imagen
                              </div>
                            )}
                          </div>
                          <div className="mosaic-snapshot-body">
                            <div>
                              <p className="mosaic-snapshot-title">
                                {snapshot.mosaicKey || "mosaico"}
                              </p>
                              <p className="mosaic-snapshot-meta">
                                {snapshot.width || snapshot.outputWidth || "?"} x{" "}
                                {snapshot.height || snapshot.outputHeight || "?"}
                              </p>
                              {snapshotDate && (
                                <p className="mosaic-snapshot-date">
                                  {snapshotDate}
                                </p>
                              )}
                            </div>
                            {canDelete && (
                              <button
                                type="button"
                                className="btn btn-xs btn-error"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setSnapshotToDelete(snapshot);
                                }}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
          {activeSection === "fotos" && (
            <div>
              {selectedUser ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4 border-b pb-3">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Perfil de colaborador
                      </p>
                      <h2 className="text-2xl font-semibold leading-tight break-all">
                        {selectedUser.email || selectedUser.id}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                        {selectedUser.name && (
                          <span className="px-3 py-1 rounded-full bg-gray-100">
                            {selectedUser.name}
                          </span>
                        )}
                        {selectedUser.age && (
                          <span className="px-3 py-1 rounded-full bg-gray-100">
                            {selectedUser.age} años
                          </span>
                        )}
                        {selectedUser.country && (
                          <span className="px-3 py-1 rounded-full bg-gray-100 flex items-center gap-2">
                            {formatCountry(selectedUser.country)}
                            {!editingCountry && (
                              <button
                                type="button"
                                className="btn btn-xs btn-outline"
                                onClick={() => setEditingCountry(true)}
                              >
                                Editar
                              </button>
                            )}
                          </span>
                        )}
                      </div>
                      {editingCountry && (
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <ReactFlagsSelect
                            searchable
                            selected={countryDraft}
                            onSelect={(code) => setCountryDraft(code)}
                            placeholder="Selecciona país"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={savingCountry}
                              onClick={handleSaveCountry}
                            >
                              {savingCountry ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => {
                                setEditingCountry(false);
                                setCountryDraft(selectedUser.country || "");
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={handleShowAllPhotos}
                      type="button"
                    >
                      Ver todas las fotos
                    </button>
                  </div>
                  {loadingPhotos ? (
                    <p>Cargando fotos...</p>
                  ) : userPhotos.length === 0 ? (
                    <p className="opacity-60">Este usuario no tiene fotos.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {userPhotos.map((photo) => (
                        <div
                          key={photo.id || photo.url}
                          className="rounded-lg shadow bg-white p-4 space-y-2"
                        >
                          <div className="relative">
                            <img
                              src={photo.imageUrl || photo.url}
                              alt={`Foto subida por ${
                                selectedUser.email || selectedUser.id
                              }`}
                              className={`w-full h-48 object-cover rounded mb-2 ${
                                photo.hidden ? "opacity-60" : ""
                              }`}
                            />
                            {photo.hidden && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="badge badge-warning text-xs sm:text-sm px-3 py-1 shadow">
                                  Foto oculta
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">
                              {photo.title || "Sin título"}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold">Descripción:</span>{" "}
                              {photo.description || "Sin descripción"}
                            </p>
                            <p className="text-xs text-gray-500 break-all">
                              <span className="font-semibold">URL:</span>{" "}
                              <a
                                href={photo.imageUrl || photo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                              >
                                {photo.imageUrl || photo.url}
                              </a>
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold">Año:</span>{" "}
                              {photo.year ?? "No especificado"}
                            </p>
                          </div>
                          <p className="text-xs font-semibold">
                            Estado:{" "}
                            <span
                              className={
                                photo.hidden
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }
                            >
                              {photo.hidden ? "Oculta" : "Visible"}
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button
                              className={`btn btn-sm ${
                                photo.hidden ? "btn-success" : "btn-warning"
                              }`}
                              disabled={
                                togglingPhotoId === (photo._id || photo.id)
                              }
                              onClick={() => handleTogglePhotoVisibility(photo)}
                              type="button"
                            >
                              {togglingPhotoId === (photo._id || photo.id) ? (
                                "Actualizando..."
                              ) : photo.hidden ? (
                                <span className="flex items-center gap-2">
                                  <FaEye /> Mostrar
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <FaEyeSlash /> Ocultar
                                </span>
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-neutral"
                              type="button"
                              onClick={() => openEditModal(photo)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-error"
                              type="button"
                              onClick={() => requestDeletePhoto(photo)}
                              disabled={
                                deletingPhotoId === (photo._id || photo.id)
                              }
                            >
                              {deletingPhotoId === (photo._id || photo.id)
                                ? "Eliminando..."
                                : "Eliminar"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : loadingAllPhotos ? (
                <p>Cargando fotos...</p>
              ) : photos.length === 0 ? (
                <p className="opacity-60">No hay fotos para mostrar.</p>
              ) : (
                <PhotoGrid
                  photos={photos}
                  onUserClick={handlePhotoOwnerClick}
                  onDeletePhoto={requestDeletePhoto}
                  onToggleHidden={handleTogglePhotoVisibility}
                  onEditPhoto={openEditModal}
                  deletingPhotoId={deletingPhotoId}
                  togglingPhotoId={togglingPhotoId}
                />
              )}
            </div>
          )}
          {activeSection === "estadisticas" && (
            <div>
              <StatsPanel onlineCount={onlineCount} />
            </div>
          )}
          {activeSection === "facts" && (
            <div>
              <FactList />
            </div>
          )}
          {activeSection === "usuarios" && (
            <div id="usuarios">
              <UserList
                onViewPhotos={handleViewPhotos}
                focusUser={focusedUser}
                onlineUsers={onlineUsers}
              />
            </div>
          )}
        </div>

        {/* La sección de fotos se muestra solo cuando se navega a "Fotos" desde el menú lateral */}
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 flex flex-col items-start min-h-full">
          {/* Sidebar content here */}
          <ul className="menu w-full grow">
            {/* HOME */}
            <li>
              <button
                onClick={() => setActiveSection("home")}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Inicio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block size-4 my-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11L12 3l9 8" />
                  <path d="M5 10v10h5v-5h4v5h5V10" />
                </svg>
                <span className="is-drawer-close:hidden">Inicio</span>
              </button>
            </li>

            {/* list item */}
            <li>
              <button
                onClick={() => setActiveSection("usuarios")}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Usuarios"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block size-4 my-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                </svg>
                <span className="is-drawer-close:hidden flex items-center gap-2">
                  Usuarios
                  <span className="badge badge-success badge-sm">
                    {onlineCount}
                  </span>
                </span>
              </button>
            </li>


            {/* list item */}
            <li>
              <button
                onClick={handleShowAllPhotos}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Fotos"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block size-4 my-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 21h18"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8 11 2 2 4-4 5 5"
                  />
                </svg>
                <span className="is-drawer-close:hidden">Fotos</span>
              </button>
            </li>

            {/* list item */}
            <li>
              <button
                onClick={() => setActiveSection("facts")}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Facts"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block size-4 my-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213 3 21l1.787-4.5L16.862 3.487Z"
                  />
                </svg>
                <span className="is-drawer-close:hidden">Facts</span>
              </button>
            </li>

            {/* list item */}
            <li>
              <button
                onClick={() => setActiveSection("estadisticas")}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Estadisticas"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block size-4 my-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
                <span className="is-drawer-close:hidden">Estadisticas</span>
              </button>
            </li>

            {/* list item */}
            <li>
              <button
                onClick={() => setActiveSection("settings")}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="inline-block size-4 my-1.5"
                >
                  <path d="M20 7h-9"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
                <span className="is-drawer-close:hidden">Settings</span>
              </button>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block size-4 my-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10v1"
                  />
                </svg>
                <span className="is-drawer-close:hidden">Cerrar sesión</span>
              </button>
            </li>
          </ul>

          {/* button to open/close drawer */}
          <div
            className="m-2 is-drawer-close:tooltip is-drawer-close:tooltip-right"
            data-tip="Open"
          >
            <label
              htmlFor="my-drawer-4"
              className="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="inline-block size-4 my-1.5"
              >
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </label>
          </div>
        </div>
      </div>

      {editingPhoto && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">Editar foto</h3>
            <form className="space-y-4" onSubmit={handleSavePhotoEdit}>
              <label className="form-control w-full">
                <span className="label-text">Título</span>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  value={editForm.title}
                  onChange={handleEditInputChange}
                  required
                />
              </label>

              <label className="form-control w-full">
                <span className="label-text">Descripción</span>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  value={editForm.description}
                  onChange={handleEditInputChange}
                  rows={3}
                ></textarea>
              </label>

              <label className="form-control w-full">
                <span className="label-text">Año</span>
                <input
                  type="number"
                  name="year"
                  className="input input-bordered w-full"
                  value={editForm.year}
                  onChange={handleEditInputChange}
                  min="0"
                />
              </label>

              {editError && (
                <p className="text-sm text-error" role="alert">
                  {editError}
                </p>
              )}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {photoToDelete && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Eliminar foto</h3>
            <p className="mb-4">
              ¿Seguro que deseas eliminar{" "}
              <strong>{photoToDelete.title || "esta foto"}</strong>? Esta acción
              no se puede deshacer.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setPhotoToDelete(null)}
                disabled={
                  deletingPhotoId === (photoToDelete._id || photoToDelete.id)
                }
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleConfirmDeletePhoto}
                disabled={
                  deletingPhotoId === (photoToDelete._id || photoToDelete.id)
                }
              >
                {deletingPhotoId === (photoToDelete._id || photoToDelete.id)
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {snapshotToDelete && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Eliminar mosaico
            </h3>
            <p className="mb-4">
              ¿Seguro que deseas eliminar{" "}
              <strong>{snapshotToDelete.mosaicKey || "este mosaico"}</strong>?
              Se borrará definitivamente de la base de datos y de Cloudinary.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setSnapshotToDelete(null)}
                disabled={deletingSnapshotId === snapshotToDelete._id}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleConfirmDeleteSnapshot}
                disabled={deletingSnapshotId === snapshotToDelete._id}
              >
                {deletingSnapshotId === snapshotToDelete._id
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
