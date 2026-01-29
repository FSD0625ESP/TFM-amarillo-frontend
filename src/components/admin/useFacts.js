

import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Custom hook to manage facts state, pagination, and CRUD operations
export default function useFacts() {
  const [facts, setFacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const factsPerPage = 10;

  // Fetch facts from API
  useEffect(() => {
    axios
      .get(`${API_URL}/api/facts`)
      .then((res) => setFacts(res.data.facts))
      .catch(() => setFacts([]));
  }, []);

  // Pagination logic
  const paginatedFacts = facts.slice(
    (currentPage - 1) * factsPerPage,
    currentPage * factsPerPage
  );

  // Add a fact
  const addFact = async (text) => {
    const res = await axios.post(`${API_URL}/api/facts`, { text });
    setFacts((prev) => [res.data.fact, ...prev]);
  };

  // Edit a fact
  const editFact = async (id, text) => {
    const res = await axios.put(`${API_URL}/api/facts/${id}`, { text });
    setFacts((prev) =>
      prev.map((fact) => (fact._id === id ? res.data.fact : fact))
    );
  };

  // Delete a fact
  const deleteFact = async (id) => {
    await axios.delete(`${API_URL}/api/facts/${id}`);
    setFacts((prev) => prev.filter((fact) => fact._id !== id));
  };

  return {
    facts,
    currentPage,
    setCurrentPage,
    factsPerPage,
    paginatedFacts,
    addFact,
    editFact,
    deleteFact,
  };
}
