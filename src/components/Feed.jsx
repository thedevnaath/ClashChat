import React from "react";
import { db } from "../firebase";
import TopicBox from "./TopicBox";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function Feed({ user, openChat }) {
  const [topics, setTopics] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    try {
      const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(
        q,
        (snap) => {
          setTopics(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setError(null);
        },
        (err) => {
          console.error("Firestore onSnapshot error:", err);
          setError(err.message);
        }
      );
      return () => unsub();
    } catch (err) {
      console.error("Feed init error:", err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: 20, 
        background: '#fee2e2',
        color: '#991b1b',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        ⚠️ Firestore Error: {error}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '20px',
        marginTop: 0
      }}>
        Active Debates
      </h2>
      {topics.length > 0 ? (
        topics.map((t) => (
          <TopicBox key={t.id} topic={t} user={user} openChat={openChat} />
        ))
      ) : (
        <div style={{ 
          padding: 40, 
          color: "#6b7280",
          textAlign: 'center',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          No topics yet — be the first to add one!
        </div>
      )}
    </div>
  );
}
