import React from "react";

export default function ProfileBar({ user }) {
  return (
    <div className="profile-bar">
      <h3>{user.displayName}</h3>
    </div>
  );
}

