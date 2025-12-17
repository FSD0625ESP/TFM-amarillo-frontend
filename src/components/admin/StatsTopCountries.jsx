import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { formatCountry } from "../../countryUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StatsTopCountries({ countries = [], loading, error }) {
  const labels = countries.map((item) => formatCountry(item.country) || item.country);
  const dataPoints = countries.map((item) => item.count || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Colaboradores",
        data: dataPoints,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} colaboradores`,
        },
      },
    },
    scales: {
      x: {
        ticks: { maxRotation: 45, minRotation: 0 },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        precision: 0,
        ticks: {
          stepSize: 1,
          callback: (value) => (Number.isInteger(value) ? value : null),
        },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  return (
    <div className="card bg-base-100 shadow border border-base-200">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Top países</h3>
            <p className="text-sm text-gray-600">
              Colaboradores con fotos visibles.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error shadow">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-gray-600">
            <span className="loading loading-spinner loading-md" />
            <span>Cargando países...</span>
          </div>
        ) : countries.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin datos de países aún.</p>
        ) : (
          <div className="w-full">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}
