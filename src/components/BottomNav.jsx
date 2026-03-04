import React from "react";
import { Home, Plus, Trophy } from "lucide-react";

export default function BottomNav({ screen, setScreen }) {
  const navItems = [
    { id: "feed", icon: Home, label: "Feed" },
    { id: "add", icon: Plus, label: "New Topic" },
    { id: "leaderboard", icon: Trophy, label: "Rankings" },
  ];

  return (
    <nav style={{ background: "transparent", padding: "12px 20px", display: "flex", justifyContent: "space-around" }}>
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id} onClick={() => setScreen(id)}
          style={{
            background: screen === id ? "var(--bg-muted)" : "transparent",
            border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            color: screen === id ? "var(--text-main)" : "var(--text-muted)",
            fontWeight: screen === id ? 600 : 500, fontSize: '14px'
          }}
        >
          <Icon size={20} color={screen === id ? "#a855f7" : "currentColor"} />
          {label}
        </button>
      ))}
    </nav>
  );
}
