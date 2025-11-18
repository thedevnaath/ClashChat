import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "messages"));
    const unsub = onSnapshot(q, (snap) => {
      const counts = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const name = data.userName || data.userId;
        counts[name] = (counts[name] || 0) + 1;
      });
      const arr = Object.keys(counts)
        .map((name) => ({ name, count: counts[name] }))
        .sort((a, b) => b.count - a.count);
      setScores(arr.slice(0, 10));
    });
    return () => unsub();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={18} color="#f59e0b" />;
    if (index === 1) return <Medal size={18} color="#9ca3af" />;
    if (index === 2) return <Award size={18} color="#cd7f32" />;
    return <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>#{index + 1}</span>;
  };

  return (
    <div>
      {scores.length === 0 && (
        <div style={{ 
          color: "#6b7280", 
          textAlign: 'center',
          padding: '20px',
          fontSize: '14px'
        }}>
          No activity yet
        </div>
      )}
      {scores.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: 'center',
            padding: "10px 0",
            borderBottom: i < scores.length - 1 ? "1px solid #f3f4f6" : "none",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {getRankIcon(i)}
            <span style={{ 
              fontSize: '14px',
              color: '#374151',
              fontWeight: i < 3 ? '600' : '400'
            }}>
              {s.name}
            </span>
          </div>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#667eea',
            background: '#ede9fe',
            padding: '4px 10px',
            borderRadius: '12px'
          }}>
            {s.count}
          </span>
        </div>
      ))}
    </div>
  );
          }
