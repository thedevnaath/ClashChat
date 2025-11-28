import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ThumbsUp, ThumbsDown, MoreVertical, Trash2, XCircle } from "lucide-react";

export default function TopicBox({ topic, user, openChat }) {
  const [showMenu, setShowMenu] = useState(false);
  const isCreator = user && topic.createdBy === user.uid;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.topic-menu-container')) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleVote = async (side) => {
    try {
      await setDoc(doc(db, "topics", topic.id, "sides", user.uid), {
        side,
        userId: user.uid,
        userName: user.displayName,
        timestamp: new Date().toISOString()
      });
      openChat(topic, side);
    } catch (err) {
      console.error("Error saving side:", err);
      alert("Error joining chat. Please try again.");
    }
  };

  const endTopic = async () => {
    if (!window.confirm("End this topic? Once ended, no one can chat further."))
      return;
    
    setShowMenu(false);
    
    try {
      await updateDoc(doc(db, "topics", topic.id), { status: "ended" });
      alert("Topic ended successfully! Generating summary...");

      const response = await fetch(
        `https://us-central1-clashchatz.cloudfunctions.net/api/summarizeDebate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId: topic.id }),
        }
      );

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      alert("✅ Summary generated successfully!");
      console.log("Summary:", data.summary);
    } catch (err) {
      console.error(err);
      alert("Error ending topic or generating summary.");
    }
  };

  const deleteTopic = async () => {
    if (!window.confirm("Delete this topic permanently? This cannot be undone."))
      return;
    
    setShowMenu(false);
    
    try {
      await deleteDoc(doc(db, "topics", topic.id));
      alert("✅ Topic deleted successfully!");
    } catch (err) {
      console.error("Error deleting topic:", err);
      alert("Error deleting topic. Please try again.");
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#111827",
              margin: "0 0 8px 0",
              lineHeight: '1.4'
            }}
          >
            {topic.topicText}
          </h3>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            by {topic.createdByName || "Unknown"}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: topic.status === "ended" ? "#fee2e2" : "#d1fae5",
              color: topic.status === "ended" ? "#991b1b" : "#065f46",
            }}
          >
            {topic.status === "ended" ? "Ended" : "Active"}
          </span>
          
          {/* Three-dot menu (only for creator) */}
          {isCreator && (
            <div className="topic-menu-container" style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <MoreVertical size={18} />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div style={{
                  position: 'absolute',
                  top: '35px',
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  minWidth: '160px',
                  overflow: 'hidden',
                  zIndex: 100
                }}>
                  {/* End Topic Option (only if active) */}
                  {topic.status !== "ended" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        endTopic();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#f59e0b',
                        transition: 'all 0.2s',
                        borderBottom: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#fffbeb'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <XCircle size={16} />
                      <span>End Topic</span>
                    </button>
                  )}
                  
                  {/* Delete Topic Option */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTopic();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#dc2626',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <Trash2 size={16} />
                    <span>Delete Topic</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {topic.status !== "ended" && (
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote("agree");
            }}
            style={{
              flex: 1,
              background: "#3b82f6",
              border: "none",
              borderRadius: 8,
              padding: 12,
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            <ThumbsUp size={18} />
            Agree
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote("disagree");
            }}
            style={{
              flex: 1,
              background: "#ec4899",
              border: "none",
              borderRadius: 8,
              padding: 12,
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            <ThumbsDown size={18} />
            Disagree
          </button>
        </div>
      )}

      {topic.status === "ended" && (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          background: '#f3f4f6',
          borderRadius: '8px',
          color: '#6b7280',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          This debate has ended
        </div>
      )}
    </div>
  );
              }
