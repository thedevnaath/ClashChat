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
import { ArrowLeft, Send } from "lucide-react";

export default function ChatRoom({ topic, user, chosenSide, closeChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch messages live
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

  // Auto scroll to latest
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: input.trim(),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        photoURL: user.photoURL || "",
        topicId: topic.id,
        timestamp: serverTimestamp(),
        side: chosenSide, // CRITICAL: save the side
      });

      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 73px - 48px)",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          background:
            chosenSide === "agree"
              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
              : "linear-gradient(135deg, #ec4899, #db2777)",
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              color: "#ffffff",
              margin: "0 0 4px 0",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {topic.topicText}
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              fontSize: 13,
            }}
          >
            You chose: {chosenSide === "agree" ? "Agree" : "Disagree"}
          </p>
        </div>
        <button
          onClick={closeChat}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.userId === user.uid;
          const msgSide = msg.side || "agree";

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  background:
                    msgSide === "agree" ? "#dbeafe" : "#fce7f3",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border:
                    msgSide === "agree"
                      ? "1px solid #bfdbfe"
                      : "1px solid #fbcfe8",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: 4,
                  }}
                >
                  {msg.userName}
                </div>
                <div style={{ fontSize: 14, color: "#111827" }}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {topic.status !== "ended" ? (
        <form
          onSubmit={sendMessage}
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              outline: "none",
              fontSize: 14,
              background: "#ffffff",
            }}
          />
          <button
            type="submit"
            style={{
              background:
                chosenSide === "agree"
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "linear-gradient(135deg, #ec4899, #db2777)",
              border: "none",
              borderRadius: 8,
              padding: "12px 20px",
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            <Send size={18} />
            Send
          </button>
        </form>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: 16,
            background: "#f3f4f6",
            borderRadius: 8,
            color: "#6b7280",
            fontStyle: "italic",
          }}
        >
          This topic has ended. You can no longer send messages.
        </div>
      )}
    </div>
  );
                    }
