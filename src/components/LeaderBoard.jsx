// src/components/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

export default function Leaderboard(){
  const [scores, setScores] = useState([]);

  useEffect(()=>{
    const q = query(collection(db, "messages"));
    const unsub = onSnapshot(q, snap=>{
      const counts = {};
      snap.docs.forEach(d=>{
        const data = d.data();
        const name = data.userName || data.userId;
        counts[name] = (counts[name] || 0) + 1;
      });
      const arr = Object.keys(counts).map(name=>({name, count: counts[name]})).sort((a,b)=>b.count-a.count);
      setScores(arr.slice(0,10));
    });
    return ()=>unsub();
  },[]);

  return (
    <div>
      {scores.length===0 && <div style={{color:"var(--muted)"}}>No activity yet</div>}
      {scores.map(s=>(
        <div key={s.name} style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><div>{s.name}</div><div>{s.count}</div></div>
      ))}
    </div>
  );
}
