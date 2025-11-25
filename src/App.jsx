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
import { LogOut, Zap } from "lucide-react";

import Feed from "./components/Feed";
import AddTopic from "./components/AddTopic";
import ChatRoom from "./components/ChatRoom";
import Leaderboard from "./components/LeaderBoard";
import ResultBox from "./components/ResultBox";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("feed");
  const [activeTopic, setActiveTopic] = useState(null);
  const [chosenSide, setChosenSide] = useState(null);
  const [liveTopics, setLiveTopics] = useState([]);
  const [debugError, setDebugError] = useState("");

  // Capture global JS errors
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

  // Auth persistence & listener
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Live topics listener
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

  const openChat = (topic, side) => {
    setActiveTopic(topic);
    setChosenSide(side);
    setScreen("chat");
  };

  const closeChat = () => {
    setScreen("feed");
    setActiveTopic(null);
    setChosenSide(null);
  };

  // Sign-in screen
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div style={{ 
          background: '#ffffff',
          padding: '48px 64px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
          }}>
            <Zap size={36} color="#ffffff" />
          </div>
          <h1 style={{ 
            color: "#111827", 
            marginBottom: 8,
            fontSize: '32px',
            fontWeight: '700'
          }}>
            ClashChatz
          </h1>
          <p style={{ 
            color: '#6b7280',
            marginBottom: 32,
            fontSize: '16px'
          }}>
            Join the debate. Pick a side. Make your voice heard.
          </p>
          <button
            onClick={signIn}
            style={{
              padding: "14px 32px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              cursor: "pointer",
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            Sign in with Google
          </button>
        </div>

        {debugError && (
          <p style={{ color: "white", marginTop: 20, textAlign: "center", background: 'rgba(239, 68, 68, 0.9)', padding: '12px 24px', borderRadius: '8px' }}>
            ⚠️ {debugError}
          </p>
        )}
      </div>
    );
  }

  // Main app UI
  return (
    <div
      className="app-container"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        display: 'flex',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        background: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 40px)'
      }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            background: '#ffffff'
            position: 'sticky',
            top: 0,
            zIndex: 999
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <Zap size={24} color="#ffffff" />
            </div>
            <h1 style={{ 
              fontSize: "24px", 
              margin: 0,
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ClashChatz
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: '16px' }}>
            <img
              src={user.photoURL}
              alt="avatar"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: '2px solid #e5e7eb'
              }}
            />
            <span style={{ fontSize: "14px", fontWeight: '500', color: '#374151' }}>
              {user.displayName}
            </span>
            <button
              onClick={logout}
              style={{
                background: "#f3f4f6",
                border: "none",
                color: "#6b7280",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Error Display */}
        {debugError && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px 24px",
              fontSize: "14px",
              borderBottom: '1px solid #fecaca'
            }}
          >
            ⚠️ <b>Error:</b> {debugError}
          </div>
        )}

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: 'hidden'
          }}
        >
          {/* Feed Column */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
            {screen === "feed" && (
              <Feed user={user} openChat={openChat} />
            )}
            {screen === "add" && (
              <AddTopic user={user} goBack={() => setScreen("feed")} />
            )}
            {screen === "chat" && activeTopic && (
              <ChatRoom
                topic={activeTopic}
                user={user}
                chosenSide={chosenSide}
                closeChat={closeChat}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ 
            width: "320px", 
            borderLeft: "1px solid #e5e7eb",
            padding: "24px",
            overflowY: 'auto',
            background: '#f9fafb'
          }}>
            <div
              style={{
                background: "#ffffff",
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Latest Result</h3>
              <ResultBox />
            </div>
            <div
              style={{
                background: "#ffffff",
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Leaderboard</h3>
              <Leaderboard />
            </div>
          </aside>
        </div>

        {/* Bottom Navigation */}
        <BottomNav screen={screen} setScreen={setScreen} />
      </div>
    </div>
  );
}

