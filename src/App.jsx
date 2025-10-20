// src/App.jsx
import React, { useEffect, useState } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import ProfileBar from "./components/ProfileBar";
import Feed from "./components/Feed";
import AddTopic from "./components/AddTopic";
import ChatRoom from "./components/ChatRoom";
import BottomNav from "./components/BottomNav";
import Leaderboard from "./components/LeaderBoard";
import ResultBox from "./components/ResultBox";

export default function App(){
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("feed"); // 'feed' | 'add' | 'chat' | 'leaderboard'
  const [activeTopic, setActiveTopic] = useState(null);
  const [liveTopics, setLiveTopics] = useState([]);

  useEffect(()=>{
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, (u)=> setUser(u));
    return ()=>unsub();
  },[]);

  useEffect(()=>{
    const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setLiveTopics(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return ()=>unsub();
  },[]);

  const signIn = async ()=> {
    await signInWithPopup(auth, provider);
  };

  const logout = async ()=> {
    await signOut(auth);
  };

  if(!user){
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <h1 style={{color:"white",marginBottom:20}}>ClashChat⚡</h1>
        <button onClick={signIn} style={{padding:"12px 20px",borderRadius:10,border:"none",background:"#7c3aed",color:"#fff",cursor:"pointer"}}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="brand">
          <div className="logo">⚡</div>
          <h1>ClashChat</h1>
        </div>
        <div className="user-block">
          <img src={user.photoURL} alt="avatar" />
          <div className="name">{user.displayName}</div>
          <button onClick={logout} style={{marginLeft:10, background:"transparent", border:"1px solid rgba(255,255,255,0.04)", color:"white", padding:"6px 8px", borderRadius:8, cursor:"pointer"}}>Log out</button>
        </div>
      </div>

      <div className="main">
        {screen === "feed" && <div className="feed-col"><Feed user={user} openChat={(topic)=>{ setActiveTopic(topic); setScreen("chat"); }} /></div>}
        {screen === "add" && <div className="feed-col"><AddTopic user={user} goBack={()=> setScreen("feed")} /></div>}
        {screen === "chat" && activeTopic && <div className="feed-col"><ChatRoom topic={activeTopic} user={user} goBack={()=> setScreen("feed")} /></div>}
        {screen === "leaderboard" && <div className="feed-col"><Leaderboard /></div>}
        <div className="side-col">
          <div className="panel">
            <h3 style={{marginTop:0}}>Latest Topic Result</h3>
            <ResultBox />
          </div>
          <div className="panel">
            <h3 style={{marginTop:0}}>Leaderboard</h3>
            <Leaderboard />
          </div>
        </div>
      </div>

      <button className="fab" onClick={()=> setScreen("add")}>+</button>

      <div className="bottom-nav">
        <button onClick={()=> setScreen("feed")}>🏠</button>
        <button onClick={()=> setScreen("add")}>➕</button>
        <button onClick={()=> setScreen("leaderboard")}>🏆</button>
      </div>
    </div>
  );
}
