import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import Feed from "./components/Feed";
import AddTopic from "./components/AddTopic";
import ChatRoom from "./components/ChatRoom";
import ProfileBar from "./components/ProfileBar";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("feed"); // feed / add-topic / chat
  const [activeTopic, setActiveTopic] = useState(null);

  // Persist login
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  if (!user) return (
    <div className="login-screen">
      <button onClick={signIn}>Sign in with Google</button>
    </div>
  );

  return (
    <div className="app-container">
      <ProfileBar user={user} />

      {screen === "feed" && (
        <Feed
          user={user}
          openChat={(topic) => {
            setActiveTopic(topic);
            setScreen("chat");
          }}
        />
      )}

      {screen === "add-topic" && <AddTopic user={user} goBack={() => setScreen("feed")} />}

      {screen === "chat" && activeTopic && (
        <ChatRoom topic={activeTopic} user={user} goBack={() => setScreen("feed")} />
      )}

      <BottomNav setScreen={setScreen} />
    </div>
  );
}
