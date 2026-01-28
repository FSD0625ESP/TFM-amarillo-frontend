import React, { useState, useEffect, useCallback } from "react";
import AdminHome from "../components/admin/AdminHome";
import AdminPhotosSection from "../components/admin/AdminPhotosSection";
import AdminSidebar from "../components/admin/AdminSidebar";
import ConfirmDeletePhotoModal from "../components/admin/ConfirmDeletePhotoModal";
import ConfirmDeleteSnapshotModal from "../components/admin/ConfirmDeleteSnapshotModal";
import EditPhotoModal from "../components/admin/EditPhotoModal";
import FactList from "../components/admin/FactList.jsx";
import UserList from "../components/admin/UserList";
import StatsPanel from "../components/admin/StatsPanel";
import "./Admin.css";
import axios from "axios";
import useOnlineUsers from "../hooks/useOnlineUsers";

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
  const [reuseAfterExhaustion, setReuseAfterExhaustion] = useState(false);
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
  const [, setConfigLoaded] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [intervalHours, setIntervalHours] = useState(24);
  const [refreshSeconds, setRefreshSeconds] = useState(30);
  const [concurrency, setConcurrency] = useState(3);

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
  }, []);

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
  }, []);
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
        reuseAfterExhaustion,
      });
      const { data } = await axios.post(`${API_URL}/mosaic/render`, {
        mosaicKey: mosaicKey.trim(),
        outputWidth,
        outputHeight,
        folder: "Mosaic",
        format: "jpg",
        concurrency: Number(concurrency) || 3,
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
      if (data.concurrency) {
        const parsedConcurrency = Number(data.concurrency);
        if (Number.isFinite(parsedConcurrency) && parsedConcurrency > 0) {
          setConcurrency(parsedConcurrency);
        }
      }
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
      if (typeof data.reuseAfterExhaustion === "boolean") {
        setReuseAfterExhaustion(data.reuseAfterExhaustion);
      }
      setConfigLoaded(true);
    } catch (err) {
      console.error("Error cargando config de mosaico:", err);
    }
  }, []);

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
          reuseAfterExhaustion,
          intervalHours: Number(intervalHours) || 24,
          refreshSeconds: Number.isFinite(Number(refreshSeconds))
            ? Number(refreshSeconds)
            : 30,
          concurrency: Number(concurrency) || 3,
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
        reuseAfterExhaustion,
        intervalHours: Number(intervalHours) || 24,
        refreshSeconds: Number.isFinite(Number(refreshSeconds))
          ? Number(refreshSeconds)
          : 30,
        concurrency: Number(concurrency) || 3,
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
        reuseAfterExhaustion,
        intervalHours: Number(intervalHours) || 24,
        refreshSeconds: Number.isFinite(Number(refreshSeconds))
          ? Number(refreshSeconds)
          : 30,
        concurrency: Number(concurrency) || 3,
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
  }, []);

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
            <AdminHome
              adminName={adminName}
              onlineCount={onlineCount}
              onlineUsers={onlineUsers}
              tilesCount={tilesCount}
              mainImageUrl={mainImageUrl}
              uploadingMainImage={uploadingMainImage}
              onUploadMainImage={handleUploadMainImage}
              tileWidth={tileWidth}
              onTileWidthChange={setTileWidth}
              tileHeight={tileHeight}
              onTileHeightChange={setTileHeight}
              mosaicKey={mosaicKey}
              onMosaicKeyChange={setMosaicKey}
              mosaicWidth={mosaicWidth}
              onMosaicWidthChange={setMosaicWidth}
              mosaicHeight={mosaicHeight}
              onMosaicHeightChange={setMosaicHeight}
              useAutoRatio={useAutoRatio}
              onToggleAutoRatio={setUseAutoRatio}
              resolvedHeight={resolvedHeight}
              allowReuse={allowReuse}
              onAllowReuseChange={setAllowReuse}
              reuseAfterExhaustion={reuseAfterExhaustion}
              onReuseAfterExhaustionChange={setReuseAfterExhaustion}
              autoEnabled={autoEnabled}
              onAutoEnabledChange={handleToggleAuto}
              savingAuto={savingAuto}
              intervalHours={intervalHours}
              onIntervalHoursChange={setIntervalHours}
              refreshSeconds={refreshSeconds}
              onRefreshSecondsChange={setRefreshSeconds}
              concurrency={concurrency}
              onConcurrencyChange={setConcurrency}
              onSaveAutoConfig={handleSaveAutoConfig}
              savingConfig={savingConfig}
              onGenerateTiles={handleGenerateTiles}
              generatingTiles={generatingTiles}
              onGenerateMosaic={handleGenerateMosaic}
              mosaicBusy={mosaicBusy}
              mosaicError={mosaicError}
              mosaicSnapshot={mosaicSnapshot}
              snapshotsError={snapshotsError}
              loadingSnapshots={loadingSnapshots}
              mosaicSnapshots={mosaicSnapshots}
              onRefreshSnapshots={fetchMosaicSnapshots}
              onOpenSnapshot={handleOpenSnapshot}
              onRequestDeleteSnapshot={setSnapshotToDelete}
            />
          )}
          {activeSection === "fotos" && (
            <AdminPhotosSection
              selectedUser={selectedUser}
              editingCountry={editingCountry}
              countryDraft={countryDraft}
              savingCountry={savingCountry}
              onStartEditCountry={() => setEditingCountry(true)}
              onCancelEditCountry={() => {
                setEditingCountry(false);
                setCountryDraft(selectedUser?.country || "");
              }}
              onCountrySelect={(code) => setCountryDraft(code)}
              onSaveCountry={handleSaveCountry}
              onShowAllPhotos={handleShowAllPhotos}
              loadingPhotos={loadingPhotos}
              userPhotos={userPhotos}
              togglingPhotoId={togglingPhotoId}
              deletingPhotoId={deletingPhotoId}
              onTogglePhotoVisibility={handleTogglePhotoVisibility}
              onEditPhoto={openEditModal}
              onDeletePhoto={requestDeletePhoto}
              loadingAllPhotos={loadingAllPhotos}
              photos={photos}
              onPhotoOwnerClick={handlePhotoOwnerClick}
            />
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

      <AdminSidebar
        onNavigate={setActiveSection}
        onShowAllPhotos={handleShowAllPhotos}
        onLogout={handleLogout}
        onlineCount={onlineCount}
      />

      <EditPhotoModal
        editingPhoto={editingPhoto}
        editForm={editForm}
        editError={editError}
        savingEdit={savingEdit}
        onClose={closeEditModal}
        onChange={handleEditInputChange}
        onSubmit={handleSavePhotoEdit}
      />

      <ConfirmDeletePhotoModal
        photoToDelete={photoToDelete}
        deletingPhotoId={deletingPhotoId}
        onCancel={() => setPhotoToDelete(null)}
        onConfirm={handleConfirmDeletePhoto}
      />

      <ConfirmDeleteSnapshotModal
        snapshotToDelete={snapshotToDelete}
        deletingSnapshotId={deletingSnapshotId}
        onCancel={() => setSnapshotToDelete(null)}
        onConfirm={handleConfirmDeleteSnapshot}
      />
    </div>
  );
}
