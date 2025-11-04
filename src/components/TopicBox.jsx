// src/components/TopicBox.jsx
import React from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function TopicBox({ topic, user, openChat }) {
  const isCreator = user && topic.createdBy === user.uid;

  // 🟢 User selects a side (agree/disagree)
  const handleSelectSide = async (e, side) => {
    e.stopPropagation(); // stop parent click
    try {
      // Store user's selected side in Firestore under topic’s "votes" subcollection
      await updateDoc(doc(db, "users", user.uid), { lastVote: side });

      // Open chat with that side
      openChat({ ...topic, userVote: side });
    } catch (err) {
      console.error("Vote side error:", err);
      alert("Error selecting side.");
    }
  };

  // 🔴 End topic and summarize
  const endTopic = async (e) => {
    e.stopPropagation();
    if (!window.confirm("End this topic? Once ended, no one can chat further.")) return;
    try {
      await updateDoc(doc(db, "topics", topic.id), { status: "ended" });
      alert("Topic ended successfully! Generating summary...");

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
        transition: "0.2s",
        cursor: topic.status === "ended" ? "default" : "pointer",
      }}
      onClick={() => openChat(topic)} // fallback if user clicks the background
    >
      {/* 🟦 Header */}
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
              onClick={endTopic}
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

      {/* 🟩 Voting Buttons */}
      {topic.status !== "ended" && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={(e) => handleSelectSide(e, "agree")}
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: 13,
              background: "#2196F3",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            👍 Agree
          </button>

          <button
            onClick={(e) => handleSelectSide(e, "disagree")}
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: 13,
              background: "#E91E63",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            👎 Disagree
          </button>
        </div>
      )}

      {/* 🟦 Summary Display */}
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
