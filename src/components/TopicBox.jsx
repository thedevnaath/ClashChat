import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function TopicBox({ topic, user }) {
  const [vote, setVote] = useState(null);
  const [percentages, setPercentages] = useState({ agree: 0, disagree: 0 });

  useEffect(() => {
    // TODO: fetch real-time vote percentages from Firestore
  }, [topic]);

  const handleVote = async side => {
    setVote(side);
    await setDoc(doc(db, "votes", `${topic.id}_${user.uid}`), {
      topicId: topic.id,
      userId: user.uid,
      voteSide: side
    });
    // TODO: Update percentages in real-time
  };

  return (
    <div className="topic-box">
      <h2>{topic.topicText}</h2>
      <div className="buttons">
        <button onClick={() => handleVote("Agree")} className="agree-button">Agree</button>
        <button onClick={() => handleVote("Disagree")} className="disagree-button">Disagree</button>
      </div>
      <div className="percentages">
        <div className="agree-percentage">{percentages.agree}%</div>
        <div className="disagree-percentage">{percentages.disagree}%</div>
      </div>
    </div>
  );
}
