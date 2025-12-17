import React, { useEffect, useMemo, useState } from "react";
import { getPublicStats, getTopCountries } from "../../services/statsService";
import StatsTopCountries from "./StatsTopCountries";

const StatCard = ({ label, value, accent }) => (
  <div className="card bg-base-100 shadow border border-base-200">
    <div className="card-body gap-1">
      <p className="text-sm uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-3xl font-bold text-${accent || "primary"}`}>
        {value?.toLocaleString ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

export default function StatsPanel({ onlineCount = 0 }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topCountries, setTopCountries] = useState([]);
  const [topError, setTopError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    setTopError("");
    try {
      const data = await getPublicStats();
      setStats(data);
      setUpdatedAt(new Date());
    } catch (err) {
      console.error("Error obteniendo estadísticas:", err);
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar las estadísticas."
      );
    }

    try {
      const countries = await getTopCountries();
      setTopCountries(countries);
    } catch (err) {
      console.error("Error obteniendo top países:", err);
      setTopError(
        err?.response?.data?.message ||
          "No se pudieron cargar los países."
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = useMemo(
    () => [
      { label: "Fotos visibles", value: stats?.photos ?? 0, accent: "primary" },
      {
        label: "Colaboradores activos",
        value: stats?.collaborators ?? 0,
        accent: "secondary",
      },
      {
        label: "Países participantes",
        value: stats?.countries ?? 0,
        accent: "accent",
      },
      { label: "Usuarios online ahora", value: onlineCount ?? 0, accent: "info" },
    ],
    [stats, onlineCount]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">Estadísticas</h2>
          <p className="text-gray-600">
            Resumen en vivo de participación y alcance.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error shadow">
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-gray-600">
          <span className="loading loading-spinner loading-md" />
          <span>Cargando estadísticas...</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                accent={card.accent}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Última actualización:{" "}
            {updatedAt
              ? updatedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </div>
        </>
      )}

      <StatsTopCountries
        countries={topCountries}
        loading={loading}
        error={topError}
      />
    </div>
  );
}
