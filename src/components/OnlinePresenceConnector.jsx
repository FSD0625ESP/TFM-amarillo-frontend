import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useReportOnline from "../hooks/useReportOnline";

/**
 * Se encarga de conectar el WS de presencia del usuario final.
 * Queda aislado para no cargar App.jsx con lógica.
 */
export default function OnlinePresenceConnector({ currentPath }) {
  const location = useLocation();
  const [email, setEmail] = useState(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const path = currentPath || location.pathname;
    const admin = path.startsWith("/admin");
    setIsAdminRoute(admin);
    if (admin) {
      setEmail(null);
      return;
    }

    const storedEmail =
      (localStorage.getItem("verifiedEmail") || "").trim().toLowerCase() ||
      (() => {
        try {
          const saved = JSON.parse(localStorage.getItem("userData") || "null");
          return saved?.email ? saved.email.toLowerCase() : null;
        } catch {
          return null;
        }
      })();

    setEmail(storedEmail || null);
  }, [currentPath, location.pathname]);

  useReportOnline({
    email: isAdminRoute ? null : email,
    allowAnonymous: !isAdminRoute,
  });

  return null;
}
