import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "topics"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTopics(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const logOut = () => {
    signOut(auth);
  };

  const createTopic = async () => {
    if (!newTopic.trim()) return alert("Enter a topic text");
    await addDoc(collection(db, "topics"), {
      topicText: newTopic,
      createdBy: user.displayName,
      createdAt: serverTimestamp(),
    });
    setNewTopic("");
    setShowCreateBox(false);
  };

  if (!user)
    return (
      <div className="login-screen">
        <h1>ClashChat⚡</h1>
        <button onClick={signIn}>Sign in with Google</button>
      </div>
    );

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h2>ClashChat⚡</h2>
        <div className="user-info">
          <span>{user.displayName}</span>
          <button className="logout-btn" onClick={logOut}>
            ⎋
          </button>
        </div>
      </header>

      {/* Topics */}
      <div className="topics-container">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-box">
            <h3>{topic.topicText}</h3>
            <p>by {topic.createdBy}</p>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        className="floating-btn"
        onClick={() => setShowCreateBox(!showCreateBox)}
      >
        +
      </button>

      {/* Create Topic Box */}
      {showCreateBox && (
        <div className="create-topic-box">
          <input
            type="text"
            placeholder="Enter a new topic..."
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
          <button onClick={createTopic}>Create</button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button>🏠</button>
        <button onClick={() => setShowCreateBox(true)}>➕</button>
        <button>👤</button>
      </nav>
    </div>
  );
      }
