import React from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function TopicBox({ topic, user, openChat }) {
  const vote = async (side) => {
    await setDoc(doc(db, "votes", `${topic.id}_${user.uid}`), {
      topicId: topic.id,
      userId: user.uid,
      voteSide: side
    });
    openChat(topic); // Navigate to chatroom after vote
  };

  return (
    <div className="topic-box">
      <p>{topic.topicText}</p>
      <div className="vote-buttons">
        <button onClick={() => vote("Agree")} className="agree">Agree</button>
        <button onClick={() => vote("Disagree")} className="disagree">Disagree</button>
      </div>
    </div>
  );
}
