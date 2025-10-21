// src/components/Feed.jsx
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
          setError(null); // clear any past error
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
      <div style={{ padding: 20, color: "red" }}>
        ⚠️ Firestore Error: {error}
      </div>
    );
  }

  return (
    <div>
      {topics.length > 0 ? (
        topics.map((t) => (
          <TopicBox key={t.id} topic={t} user={user} openChat={openChat} />
        ))
      ) : (
        <div style={{ padding: 20, color: "var(--muted)" }}>
          No topics yet — be the first to add one!
        </div>
      )}
    </div>
  );
}
