import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export default function ChatRoom({ topic, user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), where("topicId", "==", topic.id), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [topic]);

  const sendMessage = async () => {
    if (!newMsg) return;
    await addDoc(collection(db, "messages"), {
      topicId: topic.id,
      userId: user.uid,
      voteSide: "",
      messageText: newMsg,
      timestamp: serverTimestamp()
    });
    setNewMsg("");
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.voteSide === "Agree" ? "agree-bubble" : "disagree-bubble"}`}>
            {m.messageText}
          </div>
        ))}
      </div>
      <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type message..." />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
