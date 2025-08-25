import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import TopicBox from "./components/TopicBox";
import ChatRoom from "./components/ChatRoom";
import ResultBox from "./components/ResultBox";

export default function App() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState(null);

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  useEffect(() => {
    const q = query(collection(db, "topics"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setTopic({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) return <button onClick={signIn}>Sign in with Google</button>;

  return (
    <div className="app-container">
      <h1>ClashChat⚡</h1>
      {topic && <TopicBox topic={topic} user={user} />}
      {topic && <ChatRoom topic={topic} user={user} />}
      {topic && <ResultBox topic={topic} />}
    </div>
  );
}
