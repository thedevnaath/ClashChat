// src/components/AddTopic.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddTopic({ user, goBack }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const createTopic = async () => {
    if (!text.trim()) return alert("Enter topic text");

    try {
      setLoading(true);

      // Set topic to automatically end after 7 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      await addDoc(collection(db, "topics"), {
        topicText: text.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: user.displayName || "Anonymous",
        status: "active",
        agreeCount: 0,
        disagreeCount: 0,
        endDate: endDate.toISOString()
      });

      setText("");
      alert("Topic created successfully ✅");
      if (goBack) goBack();

    } catch (err) {
      console.error("Error creating topic:", err);
      alert("Failed to create topic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel add-topic">
      <h3>Create Topic</h3>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter topic..."
        disabled={loading}
        style={{ width: "100%", padding: "8px", borderRadius: 6 }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={createTopic}
          disabled={loading}
          style={{
            background: "linear-gradient(90deg,var(--accent-a),var(--accent-b))",
            border: "none",
            padding: "8px 12px",
            borderRadius: 8,
            color: "white",
            cursor: "pointer"
          }}
        >
          {loading ? "Creating..." : "Create"}
        </button>
        <button
          onClick={() => goBack && goBack()}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
