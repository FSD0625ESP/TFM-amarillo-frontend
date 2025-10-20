import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FactSection.css";

export default function FactSection() {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFact = async () => {
    setLoading(true);
    try {
      // Ajusta la baseURL si tu backend está en otro host/puerto
      const response = await axios.get("/api/facts/random");
      setFact(response.data);
    } catch (err) {
      console.error("Error fetching fact:", err);
      setFact({ text: "No se pudo cargar el dato en este momento." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

  return (
    <section className="fact-section" aria-live="polite" aria-atomic="true">
      <div className="fact-inner">
        <h3 className="fact-title">Dato curioso</h3>
        {loading ? (
          <p className="fact-loading">Cargando dato...</p>
        ) : (
          <p className="fact-text">“{fact?.text || "No hay datos."}”</p>
        )}
      </div>
    </section>
  );
}
