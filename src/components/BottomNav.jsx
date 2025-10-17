import React from "react";

export default function BottomNav({ setScreen }) {
  return (
    <div className="bottom-nav">
      <button onClick={() => setScreen("feed")}>Home</button>
      <button onClick={() => setScreen("add-topic")}>+</button>
    </div>
  );
}
