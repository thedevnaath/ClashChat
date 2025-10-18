// src/components/Feed.jsx
import React from "react";
import { db } from "../firebase";
import TopicBox from "./TopicBox";

export default function Feed({ user, openChat }){
  // Live list is provided by App (listener). To avoid duplicate listeners keep the simple pattern:
  // App passes topics via Firestore snapshot — but for simplicity, feed fetches its own snapshot:
  const [topics, setTopics] = React.useState([]);
  React.useEffect(()=>{
    const { collection, query, orderBy, onSnapshot } = require("firebase/firestore");
    const q = query(collection(db, "topics"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap=>{
      setTopics(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return ()=>unsub();
  },[]);

  return (
    <div>
      {topics.map(t => <TopicBox key={t.id} topic={t} user={user} openChat={openChat} />)}
      {topics.length === 0 && <div style={{padding:20,color:"var(--muted)"}}>No topics yet — be the first to add one!</div>}
    </div>
  );
}
