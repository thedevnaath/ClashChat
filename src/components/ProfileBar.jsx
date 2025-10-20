// src/components/ProfileBar.jsx
import React from "react";

export default function ProfileBar({ user }){
  return (
    <div className="profile-bar">
      <img src={user.photoURL} alt="avatar" style={{width:36,height:36,borderRadius:18,verticalAlign:"middle",marginRight:8}} />
      <strong>{user.displayName}</strong>
    </div>
  );
}

