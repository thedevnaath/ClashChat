import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddTopic({ user, goBack }) {
  const [text, setText] = useState("");

  const createTopic = async () => {
    if (!text.trim()) return alert("Enter topic text");
    await addDoc(collection(db, "topics"), {
      topicText: text,
      createdAt: serverTimestamp(),
      createdBy: user.uid
    });
    setText("");
    goBack();
  };

  return (
    <div className="add-topic">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter topic" />
      <button onClick={createTopic}>Add Topic</button>
      <button onClick={goBack}>Cancel</button>
    </div>
  );
}
