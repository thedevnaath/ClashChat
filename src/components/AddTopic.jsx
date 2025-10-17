import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AddTopic({ user }) {
  const [topicText, setTopicText] = useState("");
  const navigate = useNavigate();

  const handleAddTopic = async () => {
    if (!topicText.trim()) return alert("Please enter a topic!");

    await addDoc(collection(db, "topics"), {
      topicText,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByName: user.displayName,
      status: "active",
    });

    setTopicText("");
    navigate("/"); // go back to home after creating topic
  };

  return (
    <div className="add-topic">
      <h2>Create a New Debate</h2>
      <input
        type="text"
        placeholder="Enter your debate topic..."
        value={topicText}
        onChange={(e) => setTopicText(e.target.value)}
      />
      <button onClick={handleAddTopic}>Create Topic</button>
      <button onClick={() => navigate("/")}>Cancel</button>
    </div>
  );
}

