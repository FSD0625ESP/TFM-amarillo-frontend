// src/hooks/useOnlineUsers.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ANON_KEY = "tfm_anon_id";

/**
 * Se subscribe al WS de "online-users".
 * Soporta que el backend envíe solo el número, un array de usuarios
 * o un objeto { count, users }.
 */
export default function useOnlineUsers() {
  const [onlineData, setOnlineData] = useState({
    count: 0,
    users: [],
    anonymousCount: 0,
    total: 0,
  });

  useEffect(() => {
    console.log("🛰️ Conectando al WS de online users en:", SOCKET_URL);

    const { email, userId } = getStoredUserInfo();
    const anonId = getAnonId();

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        email,
        userId,
        anonId,
      },
    });

    socket.on("connect", () => {
      console.log("✅ WS conectado (admin):", socket.id);
    });

    socket.on("online-users", (payload) => {
      console.log("📡 Evento 'online-users' recibido:", payload);
      setOnlineData(parsePayload(payload));
    });

    socket.on("disconnect", () => {
      console.log("❌ WS desconectado (admin)");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return onlineData;
}

function parsePayload(payload) {
  // Si es solo un número, no hay detalle de usuarios
  if (typeof payload === "number") {
    return { count: payload, users: [], anonymousCount: 0, total: payload };
  }

  // Si viene un array, asumimos que son usuarios online
  if (Array.isArray(payload)) {
    const users = normalizeUsers(payload);
    return { count: users.length, users, anonymousCount: 0, total: users.length };
  }

  // Si es un objeto con count/users
  if (payload && typeof payload === "object") {
    const users = normalizeUsers(payload.users || []);
    const count = Number.isFinite(payload.count)
      ? payload.count
      : users.length;
    const anonymousCount = Number.isFinite(payload.anonymousCount)
      ? payload.anonymousCount
      : 0;
    const total = Number.isFinite(payload.total)
      ? payload.total
      : count + anonymousCount;
    return { count, users, anonymousCount, total };
  }

  return { count: 0, users: [], anonymousCount: 0, total: 0 };
}

function normalizeUsers(rawUsers) {
  return (rawUsers || [])
    .map((u) => {
      if (typeof u === "string") {
        return { email: u.toLowerCase(), id: null };
      }
      return {
        id: u?._id || u?.id || u?.userId || null,
        email: u?.email ? u.email.toLowerCase() : null,
      };
    })
    .filter((u) => u.email || u.id);
}

function getAnonId() {
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

function getStoredUserInfo() {
  if (typeof window === "undefined") return { email: null, userId: null };

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

  const storedId = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("userData") || "null");
      return saved?._id || saved?.id || null;
    } catch {
      return null;
    }
  })();

  return { email: storedEmail || null, userId: storedId ? String(storedId) : null };
}
