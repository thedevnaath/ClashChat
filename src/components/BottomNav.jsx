// src/components/BottomNav.jsx
import React from "react";

export default function BottomNav({ setScreen }){
  return (
    <div className="bottom-nav">
      <button onClick={()=> setScreen("feed")}>🏠</button>
      <button onClick={()=> setScreen("add")}>➕</button>
      <button onClick={()=> setScreen("leaderboard")}>🏆</button>
    </div>
  );
}
