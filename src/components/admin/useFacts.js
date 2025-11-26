

import { useState, useEffect } from "react";
import axios from "axios";

// Custom hook to manage facts state, pagination, and CRUD operations
export default function useFacts() {
  const [facts, setFacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const factsPerPage = 10;

  // Fetch facts from API
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/facts")
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
    const res = await axios.post("http://localhost:3000/api/facts", { text });
    setFacts((prev) => [res.data.fact, ...prev]);
  };

  // Edit a fact
  const editFact = async (id, text) => {
    const res = await axios.put(`http://localhost:3000/api/facts/${id}`, { text });
    setFacts((prev) =>
      prev.map((fact) => (fact._id === id ? res.data.fact : fact))
    );
  };

  // Delete a fact
  const deleteFact = async (id) => {
    await axios.delete(`http://localhost:3000/api/facts/${id}`);
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