import { useEffect, useState } from "react";
import axios from "axios";

const FactList = () => {
  const [facts, setFacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const factsPerPage = 20;
  const [showModal, setShowModal] = useState(false);
  const [newFactText, setNewFactText] = useState("");
  const [editFactId, setEditFactId] = useState(null);
  const [editFactText, setEditFactText] = useState("");
  const [factToDelete, setFactToDelete] = useState(null);

  useEffect(() => {
    const fetchFacts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/facts");
        console.log("🚀 Facts desde backend:", res.data);
        setFacts(res.data.facts);
      } catch (error) {
        console.error("Error al traer los facts:", error);
      }
    };

    fetchFacts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/facts/${id}`);
      setFacts((prev) => prev.filter((fact) => fact._id !== id));
    } catch (error) {
      console.error("Error al eliminar el fact:", error);
    }
  };

  const indexOfLastFact = currentPage * factsPerPage;
  const indexOfFirstFact = indexOfLastFact - factsPerPage;
  const currentFacts = facts.slice(indexOfFirstFact, indexOfLastFact);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Facts</h2>

      <button className="btn btn-primary mb-4" onClick={() => setShowModal(true)}>
        ➕ Agregar Fact
      </button>

      <ul className="space-y-2">
        {currentFacts.map((fact) => (
          <li
            key={fact._id}
            className="flex justify-between items-center border p-2 rounded-md"
          >
            <span>{fact.text}</span>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-warning"
                onClick={() => {
                  setEditFactId(fact._id);
                  setEditFactText(fact.text);
                  setShowModal(true);
                }}
                title="Editar"
              >
                ✏️
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={() => setFactToDelete(fact)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="join mt-6 flex justify-center">
        <button
          className="join-item btn"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          «
        </button>
        {Array.from(
          { length: Math.ceil(facts.length / factsPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`join-item btn ${
                currentPage === i + 1 ? "btn-active" : ""
              }`}
            >
              {i + 1}
            </button>
          )
        )}
        <button
          className="join-item btn"
          onClick={() =>
            setCurrentPage((prev) =>
              prev < Math.ceil(facts.length / factsPerPage) ? prev + 1 : prev
            )
          }
          disabled={currentPage === Math.ceil(facts.length / factsPerPage)}
        >
          »
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-bold mb-4">
              {editFactId ? "Editar Fact" : "Nuevo Fact"}
            </h3>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Escribí el fact..."
              value={editFactId ? editFactText : newFactText}
              onChange={(e) =>
                editFactId
                  ? setEditFactText(e.target.value)
                  : setNewFactText(e.target.value)
              }
            />
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 min-w-[140px] rounded-lg font-semibold text-white bg-gradient-to-r from-orange-300 to-orange-400 shadow-md transition-colors duration-200 hover:from-orange-400 hover:to-orange-500"
                onClick={() => {
                  setShowModal(false);
                  setEditFactId(null);
                  setEditFactText("");
                  setNewFactText("");
                }}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-3 min-w-[140px] rounded-lg font-semibold text-white bg-gradient-to-r from-orange-400 to-orange-500 shadow-md transition-colors duration-200 hover:from-orange-500 hover:to-orange-600"
                onClick={async () => {
                  try {
                    if (editFactId) {
                      const res = await axios.put(
                        `http://localhost:3000/facts/${editFactId}`,
                        { text: editFactText }
                      );
                      setFacts((prev) =>
                        prev.map((f) =>
                          f._id === editFactId ? res.data.fact : f
                        )
                      );
                    } else {
                      const res = await axios.post(
                        "http://localhost:3000/facts",
                        { text: newFactText }
                      );
                      setFacts((prev) => [res.data.fact, ...prev]);
                      setCurrentPage(1);
                    }
                    setShowModal(false);
                    setEditFactId(null);
                    setEditFactText("");
                    setNewFactText("");
                  } catch (error) {
                    console.error("Error al guardar fact:", error);
                  }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {factToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-bold mb-4">¿Eliminar este fact?</h3>
            <p className="mb-6">
              ¿Estás seguro de que querés eliminar el siguiente fact: (
              <span className="font-semibold">{factToDelete.text}</span>)?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 min-w-[140px] rounded-lg font-semibold bg-gray-200 text-gray-700 shadow-md transition-colors duration-200 hover:bg-gray-300"
                onClick={() => setFactToDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-3 min-w-[140px] rounded-lg font-semibold text-white bg-red-500 shadow-md transition-colors duration-200 hover:bg-red-600"
                onClick={async () => {
                  await handleDelete(factToDelete._id);
                  setFactToDelete(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactList;
