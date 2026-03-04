import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from "firebase/firestore";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatRoom({ topic, user, chosenSide, closeChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), where("topicId", "==", topic.id), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
  }, [topic.id]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "messages"), { text: input.trim(), userId: user.uid, userName: user.displayName || "Anonymous", photoURL: user.photoURL || "", topicId: topic.id, timestamp: serverTimestamp(), side: chosenSide });
      setInput("");
    } catch (err) { alert("Failed to send message."); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 150px)" }}>
      <div style={{ background: chosenSide === "agree" ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "linear-gradient(135deg, #ec4899, #db2777)", padding: 16, borderRadius: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ color: "#ffffff", margin: "0 0 4px 0", fontSize: 16, fontWeight: 700 }}>{topic.topicText}</h3>
          <p style={{ color: "rgba(255,255,255,0.9)", margin: 0, fontSize: 13 }}>You chose: {chosenSide === "agree" ? "Agree" : "Disagree"}</p>
        </div>
        <button onClick={closeChat} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "8px 12px", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", marginBottom: 16, display: "flex", flexDirection: "column" }}>
        {messages.map((msg) => {
          const isOwn = msg.userId === user.uid;
          const msgSide = msg.side || "agree";
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{ maxWidth: "75%", background: msgSide === "agree" ? "rgba(59, 130, 246, 0.15)" : "rgba(236, 72, 153, 0.15)", padding: "10px 14px", borderRadius: 16, border: msgSide === "agree" ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid rgba(236, 72, 153, 0.2)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{msg.userName}</div>
                <div style={{ fontSize: 15, color: "var(--text-main)", lineHeight: "1.4" }}>{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {topic.status !== "ended" ? (
        <form onSubmit={sendMessage} style={{ display: "flex", gap: 12 }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." style={{ flex: 1, padding: "14px 16px", borderRadius: 24, border: "1px solid var(--border-color)", outline: "none", fontSize: 15, background: "var(--chat-input-bg)", color: "var(--text-main)" }} />
          <button type="submit" style={{ background: chosenSide === "agree" ? "#3b82f6" : "#ec4899", border: "none", borderRadius: 24, padding: "0 20px", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: 'center' }}>
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div style={{ textAlign: "center", padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, color: "var(--text-muted)", fontStyle: "italic" }}>This topic has ended.</div>
      )}
    </div>
  );
}
