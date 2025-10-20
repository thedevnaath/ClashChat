// src/components/ChatRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

export default function ChatRoom({ topic, user, goBack }){
  const [messages, setMessages] = useState([]);
  const [voteSide, setVoteSide] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef();

  useEffect(()=>{
    // read user's vote (if any)
    const vDocRef = doc(db, "votes", `${topic.id}_${user.uid}`);
    getDoc(vDocRef).then(snap=>{
      if(snap.exists()){
        setVoteSide(snap.data().voteSide);
      }
    });

    const q = query(collection(db, "messages"), where("topicId","==",topic.id), orderBy("timestamp"));
    const unsub = onSnapshot(q, snap=>{
      setMessages(snap.docs.map(d=>({id:d.id,...d.data()})));
      // scroll to bottom
      setTimeout(()=> scrollRef.current?.scrollIntoView({behavior:"smooth"}), 50);
    });
    return ()=> unsub();
  },[topic,user]);

  const sendMessage = async () => {
    if(!newMsg.trim()) return;
    if(!voteSide) return alert("Pick a side (Agree/Disagree) from the topic first.");
    await addDoc(collection(db, "messages"), {
      topicId: topic.id,
      userId: user.uid,
      userName: user.displayName,
      voteSide,
      messageText: newMsg.trim(),
      timestamp: serverTimestamp()
    });
    setNewMsg("");
  };

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <button onClick={goBack} style={{background:"transparent",border:"none",color:"white",cursor:"pointer"}}>←</button>
        <div style={{flex:1}}><strong>{topic.topicText}</strong><div style={{fontSize:12,color:"var(--muted)"}}>Topic</div></div>
      </div>

      <div className="chat-body">
        {messages.map(m=>(
          <div key={m.id} className={`chat-bubble ${m.voteSide === "Agree" ? "bubble-agree" : "bubble-disagree"}`}>
            <div className="msg-meta">{m.userName} • {m.timestamp ? new Date(m.timestamp.seconds*1000).toLocaleString() : ""}</div>
            <div>{m.messageText}</div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <div className="chat-input-area">
        <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type your message..." maxLength={1000} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

