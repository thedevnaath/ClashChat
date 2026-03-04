import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Plus, X } from "lucide-react";

export default function AddTopic({ user, goBack }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const createTopic = async () => {
    if (!text.trim()) { alert("Please enter a topic"); return; }
    try {
      setLoading(true);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      await addDoc(collection(db, "topics"), {
        topicText: text.trim(), createdAt: serverTimestamp(), createdBy: user.uid,
        createdByName: user.displayName || "Anonymous", status: "active", agreeCount: 0, disagreeCount: 0, endDate: endDate.toISOString(),
      });
      setText(""); alert("Topic created successfully! ✅");
      if (goBack) goBack();
    } catch (err) { alert("Failed to create topic."); } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px', marginTop: 0 }}>Create New Topic</h2>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>Topic Question</label>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} disabled={loading} rows={4}
          placeholder="Enter a debatable topic... (e.g., 'Pineapple belongs on pizza')"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--chat-input-bg)', color: 'var(--text-main)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={createTopic} disabled={loading} style={{ flex: 1, background: loading ? 'var(--border-color)' : "var(--logo-gradient)", border: "none", padding: "12px 20px", borderRadius: 8, color: "white", cursor: loading ? 'not-allowed' : "pointer", fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Plus size={18} /> {loading ? "Creating..." : "Create Topic"}
          </button>
          <button onClick={() => goBack && goBack()} disabled={loading} style={{ background: 'transparent', border: "1px solid var(--border-color)", padding: "12px 20px", borderRadius: 8, cursor: loading ? 'not-allowed' : "pointer", color: 'var(--text-main)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <X size={18} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
