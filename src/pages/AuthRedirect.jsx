import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AuthRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const magicToken = params.get("token");

  useEffect(() => {
    const verify = async () => {
      if (!magicToken) {
        navigate("/email");
        return;
      }

      try {
        const res = await axios.get(
          `${API_URL}/emails/verify-token?token=${magicToken}`
        );

        // 🔐 GUARDAR SESIÓN REAL
        localStorage.setItem("userToken", res.data.token);
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("userName", res.data.name);

        navigate("/userPage"); // 👈 SIN TOKEN
      } catch (err) {
        console.error(err);
        navigate("/email");
      }
    };

    verify();
  }, []);

  return <p>Verificando sesión…</p>;
}
