// src/components/OnlineUsersBadge.jsx
import useOnlineUsers from "../hooks/useOnlineUsers";

export default function OnlineUsersBadge() {
  const { count } = useOnlineUsers();

  return (
    <span className="badge badge-info">Online: {count}</span>
  );
}
