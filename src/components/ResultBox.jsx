import React, { useState, useEffect } from "react";

export default function ResultBox({ topic }) {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch("https://YOUR_PROJECT.cloudfunctions.net/api/summarizeDebate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id })
      });
      const data = await res.json();
      setSummary(data.summary);
    };
    fetchSummary();
  }, [topic]);

  return (
    <div className="result-box">
      <h3>Debate Summary:</h3>
      <p>{summary}</p>
    </div>
  );
}
