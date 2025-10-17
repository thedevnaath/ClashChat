import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export default function ChatRoom({ topic, user, goBack }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [userVote, setUserVote] = useState("");

  useEffect(() => {
    // Get user vote
    const unsubscribeVote = onSnapshot(doc(db, "votes", `${topic.id}_${user.uid}`), docSnap => {
      if (docSnap.exists()) setUserVote(docSnap.data().voteSide);
    });

    // Get messages
    const q = query(collection(db, "messages"), where("topicId", "==", topic.id), orderBy("timestamp"));
    const unsubscribeMsg = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeVote();
      unsubscribeMsg();
    };
  }, [topic, user]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    await addDoc(collection(db, "messages"), {
      topicId: topic.id,
      userId: user.uid,
      voteSide: userVote,
      messageText: newMsg,
      timestamp: serverTimestamp()
    });
    setNewMsg("");
  };

  return (
    <div className="chat-room">
      <button onClick={goBack}>Back</button>
      <h2>{topic.topicText}</h2>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.voteSide === "Agree" ? "agree-bubble" : "disagree-bubble"}`}>
            {msg.messageText}
          </div>
        ))}
      </div>
      <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type message..." />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
