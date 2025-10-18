// src/components/TopicBox.jsx
import React from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function TopicBox({ topic, user, openChat }){
  const handleVote = async (side) => {
    // store vote doc allowing change of vote
    await setDoc(doc(db, "votes", `${topic.id}_${user.uid}`), {
      topicId: topic.id,
      userId: user.uid,
      voteSide: side,
      userName: user.displayName,
      userEmail: user.email,
      timestamp: new Date()
    });
    // navigate to chatroom
    openChat(topic);
  };

  return (
    <div className="topic-card" role="button">
      <div className="topic-top">
        <div>
          <p className="topic-text">{topic.topicText}</p>
          <div className="topic-meta">By {topic.createdByName || topic.createdBy || "Unknown"} • {topic.createdAt ? new Date(topic.createdAt.seconds ? topic.createdAt.seconds*1000 : topic.createdAt).toLocaleString() : ""}</div>
        </div>
      </div>
      <div className="topic-actions">
        <button className="vote-btn agree-btn" onClick={()=>handleVote("Agree")}>Agree</button>
        <button className="vote-btn disagree-btn" onClick={()=>handleVote("Disagree")}>Disagree</button>
      </div>
    </div>
  );
}
