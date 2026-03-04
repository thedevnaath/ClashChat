import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "messages"));
    return onSnapshot(q, (snap) => {
      const counts = {};
      snap.docs.forEach((d) => {
        const name = d.data().userName || d.data().userId;
        counts[name] = (counts[name] || 0) + 1;
      });
      const arr = Object.keys(counts).map((name) => ({ name, count: counts[name] })).sort((a, b) => b.count - a.count);
      setScores(arr.slice(0, 10));
    });
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={18} color="#f59e0b" />;
    if (index === 1) return <Medal size={18} color="#9ca3af" />;
    if (index === 2) return <Award size={18} color="#cd7f32" />;
    return <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700', width: 18, textAlign: 'center' }}>{index + 1}</span>;
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "8px 16px" }}>
      {scores.length === 0 && <div style={{ color: "var(--text-muted)", textAlign: 'center', padding: '20px', fontSize: '14px' }}>No activity yet</div>}
      {scores.map((s, i) => (
        <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', padding: "12px 0", borderBottom: i < scores.length - 1 ? "1px solid var(--border-color)" : "none" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {getRankIcon(i)}
            <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: i < 3 ? '600' : '500' }}>{s.name}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#a855f7' }}>{s.count} pts</span>
        </div>
      ))}
    </div>
  );
}
