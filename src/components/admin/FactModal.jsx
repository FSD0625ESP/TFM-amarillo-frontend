

import { useState, useEffect } from "react";

const FactModal = ({ initialValue, onClose, onSave }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (initialValue) {
      setText(initialValue.text || "");
    } else {
      setText("");
    }
  }, [initialValue]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h3 className="text-lg font-bold mb-4">
          {initialValue ? "Editar Fact" : "Nuevo Fact"}
        </h3>
        <textarea
          className="textarea textarea-bordered w-full mb-4"
          placeholder="Escribí el fact..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-3 min-w-[140px] rounded-lg font-semibold text-white bg-gradient-to-r from-orange-300 to-orange-400 shadow-md transition-colors duration-200 hover:from-orange-400 hover:to-orange-500"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-6 py-3 min-w-[140px] rounded-lg font-semibold text-white bg-gradient-to-r from-orange-400 to-orange-500 shadow-md transition-colors duration-200 hover:from-orange-500 hover:to-orange-600"
            onClick={handleSubmit}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactModal;
