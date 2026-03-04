import React from "react";
import { db } from "../firebase";
import TopicBox from "./TopicBox";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function Feed({ user, openChat }) {
  const [topics, setTopics] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));
    return onSnapshot(q, 
      (snap) => { setTopics(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setError(null); },
      (err) => setError(err.message)
    );
  }, []);

  if (error) return <div style={{ padding: 20, background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>⚠️ Error: {error}</div>;

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px', marginTop: 0 }}>Active Debates</h2>
      {topics.length > 0 ? (
        topics.map((t) => <TopicBox key={t.id} topic={t} user={user} openChat={openChat} />)
      ) : (
        <div style={{ padding: 40, color: "var(--text-muted)", textAlign: 'center', background: 'transparent', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          No topics yet — be the first to start a debate!
        </div>
      )}
    </div>
  );
}
