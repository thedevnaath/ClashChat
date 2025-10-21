import React, { useEffect, useState } from "react";
import { auth, provider, db } from "./firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import Feed from "./components/Feed";
import AddTopic from "./components/AddTopic";
import ChatRoom from "./components/ChatRoom";
import Leaderboard from "./components/LeaderBoard";
import ResultBox from "./components/ResultBox";

// ✅ Main App
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("feed"); // feed | add | chat | leaderboard
  const [activeTopic, setActiveTopic] = useState(null);
  const [liveTopics, setLiveTopics] = useState([]);
  const [debugError, setDebugError] = useState("");

  // 🔴 Capture global JS errors
  useEffect(() => {
    const errHandler = (event) => {
      const msg = event?.error?.message || event.message;
      setDebugError(msg);
    };
    const rejHandler = (event) => {
      const msg = event?.reason?.message || event.reason;
      setDebugError(msg);
    };
    window.addEventListener("error", errHandler);
    window.addEventListener("unhandledrejection", rejHandler);
    return () => {
      window.removeEventListener("error", errHandler);
      window.removeEventListener("unhandledrejection", rejHandler);
    };
  }, []);

  // 🔹 Auth persistence & listener
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔹 Live topics listener
  useEffect(() => {
    const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log("✅ Firestore topics fetched:", data.length);
        setLiveTopics(data);
      },
      (err) => {
        console.error("❌ Firestore listener error:", err.message);
        setDebugError(err.message);
      }
    );
    return () => unsub();
  }, []);

  // 🔹 Sign In / Out
  const signIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setDebugError(e.message);
    }
  };
  const logout = async () => {
    await signOut(auth);
  };

  // 🔹 If not signed in
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
        }}
      >
        <h1 style={{ color: "white", marginBottom: 20 }}>ClashChat⚡</h1>
        <button
          onClick={signIn}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            background: "#7c3aed",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>

        {debugError && (
          <p style={{ color: "red", marginTop: 20, textAlign: "center" }}>
            ⚠️ {debugError}
          </p>
        )}
      </div>
    );
  }

  // 🔹 Main App UI
  return (
    <div
      className="app-container"
      style={{
        background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {/* 🔍 Debug info line */}
      <div
        style={{
          color: "#aaa",
          textAlign: "center",
          fontSize: "13px",
          padding: "4px",
        }}
      >
        Debug → Screen: {screen} | Topics: {liveTopics?.length || 0} | User:{" "}
        {user?.email}
      </div>

      {/* 🔴 Error box (if any) */}
      {debugError && (
        <div
          style={{
            background: "red",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            margin: "10px",
            fontSize: "14px",
          }}
        >
          ⚠️ <b>JS Error:</b> {debugError}
        </div>
      )}

      {/* Header */}
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="brand" style={{ display: "flex", alignItems: "center" }}>
          <div className="logo" style={{ marginRight: 8 }}>
            ⚡
          </div>
          <h1 style={{ fontSize: "20px", margin: 0 }}>ClashChat</h1>
        </div>
        <div
          className="user-block"
          style={{ display: "flex", alignItems: "center" }}
        >
          <img
            src={user.photoURL}
            alt="avatar"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              marginRight: 8,
            }}
          />
          <div className="name" style={{ fontSize: "14px" }}>
            {user.displayName}
          </div>
          <button
            onClick={logout}
            style={{
              marginLeft: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "6px 8px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Main */}
      <div
        className="main"
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "20px",
          gap: "20px",
        }}
      >
        <div className="feed-col" style={{ flex: 2 }}>
          {screen === "feed" && (
            <Feed
              user={user}
              openChat={(topic) => {
                setActiveTopic(topic);
                setScreen("chat");
              }}
            />
          )}
          {screen === "add" && (
            <AddTopic user={user} goBack={() => setScreen("feed")} />
          )}
          {screen === "chat" && activeTopic && (
            <ChatRoom
              topic={activeTopic}
              user={user}
              goBack={() => setScreen("feed")}
            />
          )}
          {screen === "leaderboard" && <Leaderboard />}
        </div>

        <div className="side-col" style={{ flex: 1 }}>
          <div
            className="panel"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 20,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Latest Topic Result</h3>
            <ResultBox />
          </div>
          <div
            className="panel"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: 10,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Leaderboard</h3>
            <Leaderboard />
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        className="fab"
        onClick={() => setScreen("add")}
        style={{
          position: "fixed",
          bottom: 70,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#7c3aed",
          color: "white",
          fontSize: "28px",
          border: "none",
          cursor: "pointer",
        }}
      >
        +
      </button>

      {/* Bottom Navigation */}
      <div
        className="bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          onClick={() => setScreen("feed")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          🏠
        </button>
        <button
          onClick={() => setScreen("add")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ➕
        </button>
        <button
          onClick={() => setScreen("leaderboard")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          🏆
        </button>
      </div>
    </div>
  );
      }
