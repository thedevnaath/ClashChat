import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ThumbsUp, ThumbsDown, MoreVertical, Trash2, XCircle } from "lucide-react";

export default function TopicBox({ topic, user, openChat }) {
  const [showMenu, setShowMenu] = useState(false);
  const isCreator = user && topic.createdBy === user.uid;

  useEffect(() => {
    const handleClickOutside = (e) => { if (!e.target.closest('.topic-menu-container')) setShowMenu(false); };
    if (showMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleVote = async (side) => {
    try {
      await setDoc(doc(db, "topics", topic.id, "sides", user.uid), { side, userId: user.uid, userName: user.displayName, timestamp: new Date().toISOString() });
      openChat(topic, side);
    } catch (err) { alert("Error joining chat."); }
  };

  const endTopic = async () => {
    if (!window.confirm("End this topic?")) return;
    setShowMenu(false);
    try {
      await updateDoc(doc(db, "topics", topic.id), { status: "ended" });
      fetch(`https://us-central1-clashchatz.cloudfunctions.net/api/summarizeDebate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topicId: topic.id }) });
    } catch (err) { console.error(err); }
  };

  const deleteTopic = async () => {
    if (!window.confirm("Delete this topic permanently?")) return;
    setShowMenu(false);
    try { await deleteDoc(doc(db, "topics", topic.id)); } catch (err) { alert("Error deleting topic."); }
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", margin: "0 0 6px 0", lineHeight: '1.4' }}>{topic.topicText}</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>by {topic.createdByName || "Unknown"}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: topic.status === "ended" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: topic.status === "ended" ? "#ef4444" : "#10b981" }}>
            {topic.status === "ended" ? "Ended" : "Active"}
          </span>
          {isCreator && (
            <div className="topic-menu-container" style={{ position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} style={{ background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <MoreVertical size={18} />
              </button>
              {showMenu && (
                <div style={{ position: 'absolute', top: '35px', right: 0, background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: '160px', overflow: 'hidden', zIndex: 100 }}>
                  {topic.status !== "ended" && (
                    <button onClick={(e) => { e.stopPropagation(); endTopic(); }} style={{ width: '100%', padding: '12px 14px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#f59e0b', borderBottom: '1px solid var(--border-color)' }}>
                      <XCircle size={16} /><span>End Topic</span>
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteTopic(); }} style={{ width: '100%', padding: '12px 14px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }}>
                    <Trash2 size={16} /><span>Delete Topic</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {topic.status !== "ended" && (
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={(e) => { e.stopPropagation(); handleVote("agree"); }} style={{ flex: 1, background: "#3b82f6", border: "none", borderRadius: 8, padding: 12, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <ThumbsUp size={18} /> Agree
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleVote("disagree"); }} style={{ flex: 1, background: "#ec4899", border: "none", borderRadius: 8, padding: 12, color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <ThumbsDown size={18} /> Disagree
          </button>
        </div>
      )}
    </div>
  );
}
