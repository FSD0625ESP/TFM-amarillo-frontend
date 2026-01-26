import React, { useState, useEffect } from "react";
import "./Cookies.css";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) setShow(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner">
      <p>
        Usamos cookies propias y de terceros (Cloudinary) para mejorar tu
        experiencia y optimizar contenido.{" "}
      </p>
      <button onClick={acceptCookies}>Aceptar</button>
    </div>
  );
}
