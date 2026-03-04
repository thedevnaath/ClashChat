import React, { useEffect, useState } from "react";
import { auth, provider } from "./firebase";
import { supabase } from "./supabase";
import {
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import { LogOut, Zap, Moon, Sun, User } from "lucide-react";

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
  const [debugError, setDebugError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const errHandler = (event) => setDebugError(event?.error?.message || event.message);
    const rejHandler = (event) => setDebugError(event?.reason?.message || event.reason);
    window.addEventListener("error", errHandler);
    window.addEventListener("unhandledrejection", rejHandler);
    return () => {
      window.removeEventListener("error", errHandler);
      window.removeEventListener("unhandledrejection", rejHandler);
    };
  }, []);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await supabase.from('users').upsert({
            firebase_uid: u.uid, email: u.email, display_name: u.displayName, photo_url: u.photoURL
          }, { onConflict: 'firebase_uid' });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-menu-container')) setShowProfileMenu(false);
    };
    if (showProfileMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  const signIn = async () => {
    try { await signInWithPopup(auth, provider); } 
    catch (e) { setDebugError(e.message); }
  };

  const logout = async () => {
    await signOut(auth);
    setShowProfileMenu(false);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
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

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)" }}>
        <div style={{ background: '#ffffff', padding: '48px 64px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Zap size={36} color="#ffffff" />
          </div>
          <h1 style={{ color: "#111827", marginBottom: 8, fontSize: '32px', fontWeight: '700' }}>ClashChatz</h1>
          <p style={{ color: '#6b7280', marginBottom: 32, fontSize: '16px' }}>Join the debate. Pick a side.</p>
          <button onClick={signIn} style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", cursor: "pointer", fontSize: '16px', fontWeight: '600' }}>Sign in with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-body)", minHeight: "100vh", display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Header - Edge to Edge Background, Centered Content */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 999,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'center', width: '100%'
      }}>
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--logo-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: "22px", margin: 0, fontWeight: '800', background: 'var(--logo-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ClashChatz
            </h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: '16px' }}>
            <div className="profile-menu-container" style={{ position: 'relative' }}>
              <img src={user.photoURL} alt="avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ width: 36, height: 36, borderRadius: "50%", cursor: 'pointer', border: '2px solid var(--border-color)' }}
              />
              {showProfileMenu && (
                <div style={{ position: 'absolute', top: '45px', right: 0, background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '200px', overflow: 'hidden', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User size={20} color="var(--text-secondary)" />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{user.displayName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                  <button onClick={toggleDarkMode} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />} <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button onClick={logout} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }} onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    <LogOut size={18} /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {debugError && ( <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 24px", fontSize: "14px", textAlign: 'center' }}>⚠️ {debugError}</div> )}

      {/* Main Content - Centered */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex' }}>
          
          {/* Feed/Chat Area */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            {screen === "feed" && <Feed user={user} openChat={openChat} />}
            {screen === "add" && <AddTopic user={user} goBack={() => setScreen("feed")} />}
            {screen === "chat" && activeTopic && <ChatRoom topic={activeTopic} user={user} chosenSide={chosenSide} closeChat={closeChat} />}
          </div>

          {/* Sidebar Area (Hidden on Mobile via CSS) */}
          <aside style={{ width: "320px", borderLeft: "1px solid var(--border-color)", padding: "20px", overflowY: 'auto' }}>
            <div style={{ background: "transparent", paddingBottom: 20 }}>
              <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>Latest Result</h3>
              <ResultBox />
            </div>
            <div style={{ background: "transparent" }}>
              <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>Rankings</h3>
              <Leaderboard />
            </div>
          </aside>
          
        </div>
      </main>

      {/* Sticky Bottom Nav - Edge to Edge Background, Centered Content */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 999,
        background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'center', width: '100%'
      }}>
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <BottomNav screen={screen} setScreen={setScreen} />
        </div>
      </div>
    </div>
  );
}
