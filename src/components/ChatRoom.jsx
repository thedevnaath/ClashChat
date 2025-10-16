import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatRoom({ topic, user, goBack }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("topicId", "==", topic.id),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, [topic]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    await addDoc(collection(db, "messages"), {
      topicId: topic.id,
      userId: user.displayName,
      messageText: newMsg,
      timestamp: serverTimestamp(),
    });
    setNewMsg("");
  };

  return (
    <div className="chat-room-screen">
      <header className="chat-header">
        <button className="back-btn" onClick={goBack}>
          ←
        </button>
        <h3>{topic.topicText}</h3>
      </header>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              msg.userId === user.displayName ? "self" : "other"
            }`}
          >
            <span className="msg-author">{msg.userId}</span>
            <span>{msg.messageText}</span>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
