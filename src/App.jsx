import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import TopicBox from "./components/TopicBox";
import ChatRoom from "./components/ChatRoom";
import ResultBox from "./components/ResultBox";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState(null);
  const [newTopic, setNewTopic] = useState("");

  // Keep user logged in
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  // Listen for active topic
  useEffect(() => {
    const q = query(collection(db, "topics"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setTopic({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      else setTopic(null);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const createTopic = async () => {
    if (!newTopic.trim()) return alert("Enter a topic");
    await addDoc(collection(db, "topics"), {
      topicText: newTopic,
      status: "active",
      createdAt: new Date(),
      createdBy: user.uid,
    });
    setNewTopic("");
  };

  if (!user) {
    return (
      <div className="login-page">
        <button className="login-btn" onClick={signIn}>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1 className="title">ClashChat ⚡</h1>

      <div className="create-topic">
        <input
          type="text"
          placeholder="Enter a new debate topic..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button onClick={createTopic}>Create</button>
      </div>

      {topic ? (
        <div className="main-section">
          <TopicBox topic={topic} user={user} />
          <ChatRoom topic={topic} user={user} />
          <ResultBox topic={topic} />
        </div>
      ) : (
        <p className="no-topic">No active topic. Create one above 👆</p>
      )}
    </div>
  );
}
