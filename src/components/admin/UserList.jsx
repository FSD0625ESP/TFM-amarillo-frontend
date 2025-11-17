import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function UserList({ onViewPhotos, focusUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalUser, setModalUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  useEffect(() => {
    axios
      .get(`${API_BASE}/emails`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error cargando usuarios:", err))
      .finally(() => setLoading(false));
  }, []);

  const openDeleteModal = (user) => setModalUser(user);
  const closeDeleteModal = () => setModalUser(null);

  const handleDelete = async () => {
    if (!modalUser) return;
    try {
      await axios.delete(`${API_BASE}/emails/${modalUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== modalUser._id));
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    } finally {
      closeDeleteModal();
    }
  };

  useEffect(() => {
    if (focusUser?.email) {
      setSearch(focusUser.email);
      setCurrentPage(1);
      setTimeout(() => {
        const row = document.querySelector(
          `[data-user-email="${focusUser.email}"]`
        );
        row?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }
  }, [focusUser]);

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  if (loading) return <p className="p-6">Cargando usuarios...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Usuarios registrados</h1>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por email..."
          className="input input-bordered w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* No users */}
      {filteredUsers.length === 0 && (
        <p className="opacity-60">No hay usuarios para mostrar.</p>
      )}

      {/* Table */}
      {filteredUsers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-lg">
                <th>Email</th>
                <th>Fecha de registro</th>
                <th>Fotos subidas</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => {
                const isFocused = focusUser?.email === u.email;
                return (
                  <tr
                    key={u._id}
                    data-user-email={u.email}
                    className={isFocused ? "bg-blue-50" : ""}
                  >
                    <td>{u.email}</td>
                    <td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td>{u.photosCount ?? 0}</td>
                    <td className="text-center flex gap-2 justify-center">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          onViewPhotos({ id: u._id, email: u.email })
                        }
                      >
                        Ver fotos
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => openDeleteModal(u)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="join flex justify-center mt-6">
          <button
            className="join-item btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`join-item btn ${currentPage === i + 1 ? "btn-active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="join-item btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            »
          </button>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {modalUser && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Eliminar usuario</h3>
            <p className="py-4">
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong>{modalUser.email}</strong>?
            </p>
            <div className="modal-action">
              <button className="btn" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
