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
        if (snap.exists()) {
          setSummary(snap.data().summary || "");
        }
      } catch (e) {
        console.error("Error loading results:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        color: "#6b7280", 
        fontSize: '14px',
        textAlign: 'center',
        padding: '20px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {summary ? (
        <div style={{
          background: '#f9fafb',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FileText size={16} color="#667eea" />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#667eea',
              textTransform: 'uppercase'
            }}>
              Latest Summary
            </span>
          </div>
          <div style={{ 
            whiteSpace: "pre-wrap",
            fontSize: '14px',
            color: '#374151',
            lineHeight: '1.6'
          }}>
            {summary}
          </div>
        </div>
      ) : (
        <div style={{ 
          color: "#6b7280",
          fontSize: '14px',
          textAlign: 'center',
          padding: '20px'
        }}>
          No results yet
        </div>
      )}
    </div>
  );
}
