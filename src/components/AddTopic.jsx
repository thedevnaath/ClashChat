// src/components/AddTopic.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddTopic({ user, goBack }){
  const [text, setText] = useState("");

  const createTopic = async () => {
    if (!text.trim()) return alert("Enter topic text");
    await addDoc(collection(db, "topics"), {
      topicText: text.trim(),
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByName: user.displayName,
      status: "active" // active until monthly auto-end
    });
    setText("");
    if (goBack) goBack();
  };

  return (
    <div className="panel add-topic">
      <h3>Create Topic</h3>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Enter topic..." />
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={createTopic} style={{background:"linear-gradient(90deg,var(--accent-a),var(--accent-b))",border:"none",padding:"8px 12px",borderRadius:8,color:"white"}}>Create</button>
        <button onClick={()=>goBack && goBack()} style={{padding:"8px 12px",borderRadius:8}}>Cancel</button>
      </div>
    </div>
  );
}

