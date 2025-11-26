import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null); // null = cargando

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) return setIsValid(false);

      try {
        await axios.post(
          `${API_URL}/admins/verify-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsValid(true); // token válido
      } catch (error) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminName");
        setIsValid(false);
      }
    };

    verifyToken();
  }, []);

  // Mientras se verifica
  if (isValid === null) return <p>Validando sesión...</p>;

  // Si no es válido, redirigir
  return isValid ? children : <Navigate to="/adminlogin" replace />;
};

export default ProtectedRoute;
