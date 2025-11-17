import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Plus, X } from "lucide-react";

export default function AddTopic({ user, goBack }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const createTopic = async () => {
    if (!text.trim()) {
      alert("Please enter a topic");
      return;
    }

    try {
      setLoading(true);

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      await addDoc(collection(db, "topics"), {
        topicText: text.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: user.displayName || "Anonymous",
        status: "active",
        agreeCount: 0,
        disagreeCount: 0,
        endDate: endDate.toISOString(),
      });

      setText("");
      alert("Topic created successfully! ✅");
      if (goBack) goBack();
    } catch (err) {
      console.error("Error creating topic:", err);
      alert("Failed to create topic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '20px',
        marginTop: 0
      }}>
        Create New Topic
      </h2>
      
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Topic Question
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a debatable topic... (e.g., 'Pineapple belongs on pizza')"
          disabled={loading}
          rows={4}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={createTopic}
            disabled={loading}
            style={{
              flex: 1,
              background: loading 
                ? '#d1d5db' 
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              padding: "12px 20px",
              borderRadius: 8,
              color: "white",
              cursor: loading ? 'not-allowed' : "pointer",
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} />
            {loading ? "Creating..." : "Create Topic"}
          </button>
          <button
            onClick={() => goBack && goBack()}
            disabled={loading}
            style={{
              background: '#f3f4f6',
              border: "none",
              padding: "12px 20px",
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : "pointer",
              color: '#6b7280',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
            }
