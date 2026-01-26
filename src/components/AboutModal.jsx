import { useEffect, useRef } from "react";
import "./AboutModal.css";

export default function AboutModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement;
    modalRef.current.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();

      // Focus trap
      if (e.key === "Tab") {
        const focusable = modalRef.current.querySelectorAll(
          'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <section
        className="about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        tabIndex="-1"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="about-modal-close"
          aria-label="Cerrar información sobre el proyecto"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="about-title">Un proyecto Full Stack con alma</h2>

        <p>
          Esta <strong>API</strong> ha sido desarrollada por tres estudiantes de
          Ecuador, Argentina y España como proyecto final del Máster en Full
          Stack Development, con un objetivo claro: demostrar nuestro
          conocimiento técnico como desarrolladores, pero también nuestra
          capacidad para crear productos digitales con identidad, criterio y
          propósito.
        </p>

        <p>
          Elegimos la Sagrada Familia como símbolo que une tecnología, cultura y
          la ciudad de Barcelona, donde reside también{" "}
          <a
            href="https://nuclio.school/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            nuclio digital school
          </a>{" "}
          la institución que nos formó. Este año tan especial para la Basílica,
          era la ocasión ideal para rendirle homenaje creando toda una{" "}
          <strong>experiencia digital</strong>. Por eso, más que un mero
          proyecto académico, esta web refleja cómo el desarrollo Full Stack
          sirve para <strong>contar historias</strong> y crear{" "}
          <strong>productos con propósito.</strong>
        </p>

        <p>
          Esta plataforma es nuestra carta de presentación como profesionales y
          refleja nuestra forma de trabajar:{" "}
          <strong>
            cuidado técnico, visión creativa y compromiso con proyectos que
            conecten a las personas.
          </strong>
        </p>
      </section>
    </div>
  );
}
