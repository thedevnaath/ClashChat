import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import TopicBox from "./components/TopicBox";
import ChatRoom from "./components/ChatRoom";
import ResultBox from "./components/ResultBox";

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
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <button
          onClick={signIn}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">ClashChat ⚡</h1>

      {/* Create Topic */}
      <div className="max-w-xl mx-auto mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Enter a new debate topic..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={createTopic}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Create
        </button>
      </div>

      {/* Active Topic */}
      {topic ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <TopicBox topic={topic} user={user} />
          <ChatRoom topic={topic} user={user} />
          <ResultBox topic={topic} />
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No active topic. Create one above 👆</p>
      )}
    </div>
  );
}
