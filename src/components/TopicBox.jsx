// src/components/TopicBox.jsx
import React from "react";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export default function TopicBox({ topic, user, openChat }) {
  const isCreator = user && topic.createdBy === user.uid;

  // 🟢 Handle voting
  const handleVote = async (e, type) => {
    e.stopPropagation();
    try {
      const topicRef = doc(db, "topics", topic.id);
      const field = type === "agree" ? "agreeCount" : "disagreeCount";
      await updateDoc(topicRef, { [field]: increment(1) });
    } catch (err) {
      console.error("Vote error:", err);
      alert("Error submitting vote.");
    }
  };

  // 🔴 End topic and trigger summary
  const endTopic = async (e) => {
    e.stopPropagation();
    if (!window.confirm("End this topic? Once ended, no one can chat further.")) return;
    try {
      // 1️⃣ Update Firestore
      await updateDoc(doc(db, "topics", topic.id), { status: "ended" });
      alert("Topic ended successfully! Generating summary...");

      // 2️⃣ Trigger Cloud Function to summarize
      const response = await fetch(
        `https://us-central1-clashchatz.cloudfunctions.net/api/summarizeDebate`,
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
        </div>
      </div>

      {/* 🟩 Buttons Section */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "flex-start",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={(e) => handleVote(e, "agree")}
          disabled={topic.status === "ended"}
          style={{
            padding: "4px 8px",
            fontSize: 12,
            background: "#00c853",
            border: "none",
            borderRadius: 6,
            cursor: topic.status === "ended" ? "not-allowed" : "pointer",
            color: "white",
          }}
        >
          👍 Agree ({topic.agreeCount || 0})
        </button>

        <button
          onClick={(e) => handleVote(e, "disagree")}
          disabled={topic.status === "ended"}
          style={{
            padding: "4px 8px",
            fontSize: 12,
            background: "#ff3d00",
            border: "none",
            borderRadius: 6,
            cursor: topic.status === "ended" ? "not-allowed" : "pointer",
            color: "white",
          }}
        >
          👎 Disagree ({topic.disagreeCount || 0})
        </button>

        {isCreator && topic.status !== "ended" && (
          <button
            onClick={endTopic}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              background: "#ff1744",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "white",
            }}
          >
            🔚 End Topic
          </button>
        )}
      </div>

      {/* 🟦 Summary Section */}
      {topic.summary && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <strong>Summary:</strong>
          <p style={{ marginTop: 5 }}>{topic.summary}</p>
        </div>
      )}
    </div>
  );
        }
