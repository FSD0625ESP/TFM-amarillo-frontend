import React, { useEffect, useState } from "react";
import useReportOnline from "../hooks/useReportOnline";
import { jwtDecode } from "jwt-decode"; // Asegúrate de tener esto instalado

export default function OnlinePresenceConnector() {
  const [identity, setIdentity] = useState({ email: null, userId: null });

  useEffect(() => {
    // 1. Intentar leer del Token nuevo (La forma más segura tras tu cambio)
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIdentity({ 
          email: decoded.email, 
          userId: decoded.userId // Ahora el token SÍ tiene userId
        });
        return;
      } catch (e) {
        console.error("Error decodificando token para WS:", e);
      }
    }

    // 2. Fallback: Leer datos sueltos del localStorage (por si acaso)
    const storedEmail = localStorage.getItem("userEmail");
    const storedData = localStorage.getItem("userData"); // Compatibilidad antigua
    
    if (storedEmail) {
      setIdentity({ email: storedEmail, userId: null });
    } else if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setIdentity({ email: parsed.email, userId: parsed._id });
      } catch {}
    }
  }, []); // Se ejecuta al montar la App

  // allowAnonymous={true} para contar a los de la Home
  useReportOnline({
    email: identity.email,
    userId: identity.userId,
    allowAnonymous: true 
  });

  return null; // Este componente no renderiza nada visual
}