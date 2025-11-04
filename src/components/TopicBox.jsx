// src/components/TopicBox.jsx
import React from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function TopicBox({ topic, user, openChat }) {
  const isCreator = user && topic.createdBy === user.uid;

  const endTopic = async () => {
    if (!window.confirm("End this topic? Once ended, no one can chat further.")) return;
    try {
      // 1️⃣ Update Firestore
      await updateDoc(doc(db, "topics", topic.id), { status: "ended" });
      alert("Topic ended successfully! Generating summary...");

      // 2️⃣ Trigger Cloud Function to summarize
      const response = await fetch(
        `https://us-central1-${process.env.REACT_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/api/summarizeDebate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId: topic.id }),
        }
      );

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      alert("✅ Summary generated successfully!");
      console.log("Summary:", data.summary);
    } catch (err) {
      console.error(err);
      alert("Error ending topic or generating summary.");
    }
  };

  return (
    <div
      className="topic-box"
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        background:
          topic.status === "ended"
            ? "linear-gradient(90deg,#2c2c2c,#1c1c1c)"
            : "linear-gradient(90deg,var(--accent-a),var(--accent-b))",
        color: "white",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onClick={() => openChat(topic)}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <b>{topic.topicText}</b>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            By {topic.createdByName || "Unknown"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 12,
              color: topic.status === "ended" ? "red" : "lime",
              fontWeight: "bold",
            }}
          >
            {topic.status === "ended" ? "Ended" : "Active"}
          </div>
          {isCreator && topic.status !== "ended" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                endTopic();
              }}
              style={{
                marginTop: 5,
                padding: "4px 8px",
                fontSize: 12,
                background: "#ff4d4d",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: "white",
              }}
            >
              End
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
