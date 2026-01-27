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
    </div>
  );
}
