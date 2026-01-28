import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
          `http://localhost:3000/emails/verify-token?token=${magicToken}`
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
