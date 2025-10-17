import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import TopicBox from "./TopicBox";

export default function Feed({ user, openChat }) {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      setTopics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="feed">
      {topics.map(topic => (
        <TopicBox key={topic.id} topic={topic} user={user} openChat={openChat} />
      ))}
    </div>
  );
}

