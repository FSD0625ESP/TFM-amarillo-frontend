import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MagicLinkVerification() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Token inválido o ausente.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verify?token=${token}`
        );
        if (res.data.success) {
          // Guarda el email verificado o el token si lo necesitas
          localStorage.setItem("verifiedEmail", res.data.email);
          navigate("/registration");
        } else {
          setError("El enlace no es válido o ha expirado.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al verificar el enlace.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  if (loading) return <p>Verificando enlace mágico...</p>;
  if (error) return <p className="error">{error}</p>;

  return null;
}
