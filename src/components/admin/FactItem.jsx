const FactItem = ({ fact, onDelete }) => {
  const modalId = `modal-${fact._id}`;

  return (
    <>
      <li className="flex justify-between items-center border p-2 rounded-md">
        <span>{fact.text}</span>
        <button
          className="btn btn-sm btn-error"
          onClick={() => document.getElementById(modalId).showModal()}
        >
          Eliminar
        </button>
      </li>

      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">¿Eliminar este fact?</h3>
          <p className="py-4">Esta acción no se puede deshacer.</p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => document.getElementById(modalId).close()}
            >
              Cancelar
            </button>
            <button
              className="btn btn-error"
              onClick={() => {
                onDelete(); // tu lógica
                document.getElementById(modalId).close();
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};