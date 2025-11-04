import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
} from "firebase/firestore";

export default function ChatRoom({ topic, user, chosenSide, closeChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [side] = useState(chosenSide);
  const messagesEndRef = useRef(null);

  // 🔄 Fetch messages live
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("topicId", "==", topic.id),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [topic.id]);

  // ⬇️ Auto scroll to latest
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: input,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      topicId: topic.id,
      timestamp: serverTimestamp(),
      side,
    });

    setInput("");
  };

  const getBubbleColor = (msgSide) => {
    if (msgSide === "agree") return "rgba(33,150,243,0.25)"; // blue tint
    if (msgSide === "disagree") return "rgba(233,30,99,0.25)"; // pink tint
    return "#333";
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#121212",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔹 Header */}
      <div
        style={{
          padding: "12px 16px",
          background:
            side === "agree"
              ? "linear-gradient(90deg,#1565c0,#1e88e5)"
              : "linear-gradient(90deg,#ad1457,#d81b60)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <b>{topic.topicText}</b>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {side === "agree" ? "You chose: Agree 👍" : "You chose: Disagree 👎"}
          </div>
        </div>
        <button
          onClick={closeChat}
          style={{
            background: "transparent",
            border: "1px solid white",
            borderRadius: 6,
            color: "white",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          ⬅ Back
        </button>
      </div>

      {/* 💬 Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.userId === user.uid ? "flex-end" : "flex-start",
              background: getBubbleColor(msg.side),
              marginBottom: 10,
              borderRadius: 10,
              padding: "8px 12px",
              maxWidth: "75%",
              wordWrap: "break-word",
              border:
                msg.userId === user.uid
                  ? "1px solid rgba(255,255,255,0.2)"
                  : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {msg.userName} ({msg.side === "agree" ? "👍" : "👎"})
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ✏️ Input */}
      {topic.status !== "ended" ? (
        <form
          onSubmit={sendMessage}
          style={{
            display: "flex",
            padding: 10,
            borderTop: "1px solid #333",
            background: "#1e1e1e",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              outline: "none",
              background: "#2c2c2c",
              color: "white",
            }}
          />
          <button
            type="submit"
            style={{
              marginLeft: 10,
              background:
                side === "agree"
                  ? "linear-gradient(90deg,#1976d2,#42a5f5)"
                  : "linear-gradient(90deg,#d81b60,#f06292)",
              border: "none",
              borderRadius: 8,
              color: "white",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Send
          </button>
        </form>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: 16,
            background: "#1e1e1e",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          This topic has ended. You can no longer send messages.
        </div>
      )}
    </div>
  );
        }
