import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
import TopicBox from "./components/TopicBox";
import ChatRoom from "./components/ChatRoom";
import ResultBox from "./components/ResultBox";

export default function App() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState(null);
  const [newTopic, setNewTopic] = useState("");

import { signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";

useEffect(() => {
  // Keep user logged in even after refresh
  setPersistence(auth, browserLocalPersistence);
  
  // Check login state continuously
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
  
  return () => unsubscribe();
}, []);

  // 🔹 Listen for active topic
  useEffect(() => {
    const q = query(collection(db, "topics"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setTopic({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setTopic(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Create a new topic
  const createTopic = async () => {
    if (!newTopic.trim()) return alert("Enter a topic text");

    // Mark any existing topic as inactive
    const q = query(collection(db, "topics"), where("status", "==", "active"));
    const snapshot = await onSnapshot(q, () => {}); // just placeholder
    // (we’ll handle closing old ones manually later if needed)

    await addDoc(collection(db, "topics"), {
      topicText: newTopic,
      status: "active",
      createdAt: new Date(),
      createdBy: user.uid,
    });
    setNewTopic("");
  };

  if (!user) return <button onClick={signIn}>Sign in with Google</button>;

  return (
    <div className="app-container">
      <h1>ClashChat⚡</h1>

      {/* Create Topic Section */}
      <div className="create-topic">
        <input
          type="text"
          placeholder="Enter a new debate topic..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button onClick={createTopic}>Create Topic</button>
      </div>

      {/* Active Topic Display */}
      {topic ? (
        <>
          <TopicBox topic={topic} user={user} />
          <ChatRoom topic={topic} user={user} />
          <ResultBox topic={topic} />
        </>
      ) : (
        <p>No active topic. Create one above 👆</p>
      )}
    </div>
  );
      }
