import React from "react";
import { Home, Plus, Trophy } from "lucide-react";

export default function BottomNav({ screen, setScreen }) {
  const navItems = [
    { id: "feed", icon: Home, label: "Feed" },
    { id: "add", icon: Plus, label: "New Topic" },
    { id: "leaderboard", icon: Trophy, label: "Rankings" },
  ];

  return (
    <nav
      style={{
        background: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setScreen(id)}
          style={{
            background: screen === id ? "#ede9fe" : "transparent",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: screen === id ? "#7c3aed" : "#6b7280",
            fontWeight: 500,
            fontSize: '14px',
            transition: "all 0.2s",
          }}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  );
}

