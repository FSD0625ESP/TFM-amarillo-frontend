// src/hooks/useReportOnline.js
import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ANON_KEY = "tfm_anon_id";

/**
 * Conecta el frontend de usuario al WS para reportar presencia.
 * Enviar el email (o userId) en el handshake permite al admin ver quién está online.
 * Cuando allowAnonymous es true, se generará/persistirá un anonId y también contará como visitante.
 */
export default function useReportOnline({ email, userId, allowAnonymous = false }) {
  useEffect(() => {
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : null;
    const normalizedId = userId ? String(userId) : null;
    const isAnonymous = !normalizedEmail && !normalizedId;

    if (!normalizedEmail && !normalizedId && !allowAnonymous) return;

    const anonId = isAnonymous ? getOrCreateAnonId() : null;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        email: normalizedEmail,
        userId: normalizedId,
        anonId,
      },
    });

    socket.on("connect", () => {
      console.log("✅ WS conectado (user presence):", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ WS desconectado (user presence)");
    });

    return () => {
      socket.disconnect();
    };
  }, [email, userId, allowAnonymous]);
}

function getOrCreateAnonId() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(ANON_KEY);
  if (stored && stored.trim() !== "") return stored;

  const newId =
    (typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function" &&
      crypto.randomUUID()) ||
    `anon-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(ANON_KEY, newId);
  return newId;
}
