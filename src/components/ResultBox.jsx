// src/components/ResultBox.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ResultBox(){
  const [summary, setSummary] = useState("");

  useEffect(()=>{
    // Assume we store results in `results/{topicId}`
    // We'll read the most recent result by querying topics with status ended - but for simplicity try to check 'results/latest' doc if functions writes it
    async function load(){
      try{
        // Try a results/latest doc
        const snap = await getDoc(doc(db, "results", "latest"));
        if(snap.exists()) setSummary(snap.data().summary || "");
      }catch(e){
        console.error(e);
      }
    }
    load();
  },[]);

  return (
    <div>
      { summary ? <div style={{whiteSpace:"pre-wrap"}}>{summary}</div> : <div style={{color:"var(--muted)"}}>No results yet</div> }
    </div>
  );
}
