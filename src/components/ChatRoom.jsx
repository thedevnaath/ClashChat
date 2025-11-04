import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function ChatRoom({ topic, user, closeChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [side, setSide] = useState(null); // "agree" | "disagree"
  const messagesEndRef = useRef(null);

  // Load chat messages
  useEffect(() => {
    if (!topic?.id) return;
    const q = query(
      collection(db, "topics", topic.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [topic.id]);

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message send
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "topics", topic.id, "messages"), {
        text: input,
        uid: user.uid,
        userName: user.displayName || "Anonymous",
        timestamp: serverTimestamp(),
        side,
      });
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle topic end
  const endTopic = async () => {
    if (!window.confirm("End this topic? Once ended, no one can chat further.")) return;
    try {
      await updateDoc(doc(db, "topics", topic.id), { status: "ended" });
      alert("Topic ended successfully! Generating summary...");

      // Trigger ChatGPT summarize function
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

  // Choose side
  if (!side) {
    return (
      <div
        style={{
          background: "#111",
          color: "white",
          height: "100vh",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2>{topic.topicText}</h2>
        <p>Choose your side to enter the debate:</p>
        <div style={{ marginTop: 30 }}>
          <button
            onClick={() => setSide("agree")}
            style={{
              background: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 16,
              marginRight: 10,
              cursor: "pointer",
            }}
          >
            👍 Agree
          </button>
          <button
            onClick={() => setSide("disagree")}
            style={{
              background: "#e91e63",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            👎 Disagree
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#0d0d0d",
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #333",
          background: "black",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3>{topic.topicText}</h3>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {topic.status === "ended" ? "🔴 Debate Ended" : `🟢 You’re on the ${side} side`}
          </div>
        </div>
        <div>
          {topic.createdBy === user.uid && topic.status !== "ended" && (
            <button
              onClick={endTopic}
              style={{
                background: "#ff4d4d",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                color: "white",
              }}
            >
              End Topic
            </button>
          )}
          <button
            onClick={closeChat}
            style={{
              marginLeft: 10,
              background: "#444",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              color: "white",
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          background: "#121212",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              background:
                msg.side === "agree"
                  ? "rgba(33,150,243,0.15)"
                  : "rgba(233,30,99,0.15)",
              border:
                msg.side === "agree"
                  ? "1px solid #2196f3"
                  : "1px solid #e91e63",
              color: msg.side === "agree" ? "#90caf9" : "#f48fb1",
              borderRadius: 8,
              padding: 8,
              marginBottom: 6,
              alignSelf: msg.uid === user.uid ? "flex-end" : "flex-start",
              maxWidth: "70%",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 13 }}>
              {msg.userName}
            </div>
            <div style={{ fontSize: 14 }}>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      {topic.status !== "ended" && (
        <form
          onSubmit={sendMessage}
          style={{
            display: "flex",
            padding: 10,
            borderTop: "1px solid #333",
            background: side === "agree" ? "#0d47a1" : "#880e4f",
          }}
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              padding: "10px 12px",
              borderRadius: 6,
              background: "#222",
              color: "white",
            }}
          />
          <button
            type="submit"
            style={{
              marginLeft: 8,
              background: "limegreen",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
                }
