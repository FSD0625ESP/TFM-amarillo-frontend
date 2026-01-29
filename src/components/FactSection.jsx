import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FactSection.css";

export default function FactSection() {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchFact = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/facts/random`);
      console.log("Fetching new fact");
      setFact(response.data.fact);
    } catch (err) {
      console.error("Error fetching fact:", err);
      setFact("No se pudo cargar el dato en este momento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
    const interval = setInterval(() => {
      fetchFact();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="fact-section" aria-live="polite" aria-atomic="true">
      <div className="fact-inner">
        {fact && (
          <p key={fact?._id || "default"} className="fact-text animate-fade-in">
            “{fact?.text || fact || "No hay datos."}”
          </p>
        )}
      </div>
    </section>
  );
}
