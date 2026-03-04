import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { FileText } from "lucide-react";

export default function ResultBox() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "results", "latest"));
        if (snap.exists()) setSummary(snap.data().summary || "");
      } catch (e) { console.error("Error loading results:", e); } 
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div style={{ color: "var(--text-muted)", fontSize: '14px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      {summary ? (
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileText size={16} color="#a855f7" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#a855f7', textTransform: 'uppercase' }}>AI Summary</span>
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            {summary}
          </div>
        </div>
      ) : (
        <div style={{ color: "var(--text-muted)", fontSize: '14px', textAlign: 'center', padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
          No recent summaries
        </div>
      )}
    </div>
  );
}
