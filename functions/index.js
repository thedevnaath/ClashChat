// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

// ⚙️ OpenAI config from Firebase environment (GitHub secret)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * 📘 Summarize Debate
 * Automatically generates a summary for a topic’s debate
 * and stores it in Firestore under "results/{topicId}"
 */
app.post("/summarizeDebate", async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!topicId) return res.status(400).send("Missing topicId");

    const topicDoc = await db.collection("topics").doc(topicId).get();
    if (!topicDoc.exists) return res.status(404).send("Topic not found");

    const topic = topicDoc.data();

    const messagesSnap = await db
      .collection("messages")
      .where("topicId", "==", topicId)
      .orderBy("timestamp")
      .get();

    const messages = messagesSnap.docs.map((doc) => doc.data());

    const prompt = `
Topic: ${topic.topicText}
Debate Messages:
${messages.map((m) => `${m.voteSide}: ${m.messageText}`).join("\n")}
---
Summarize this debate in a few sentences and decide the winning side (Agree or Disagree).
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = completion.choices[0].message.content;

    await db.collection("results").doc(topicId).set({
      topicId,
      summary,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Summary stored for topic: ${topicId}`);
    res.json({ summary });
  } catch (err) {
    console.error("❌ Error in summarizeDebate:", err);
    res.status(500).send("Error generating summary");
  }
});

/**
 * 🕒 Auto End Old Topics
 * Runs every 24 hours and marks topics older than 30 days as ended
 */
exports.autoEndOldTopics = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysAgo = new Date(
      now.toDate().getTime() - 30 * 24 * 60 * 60 * 1000
    );

    console.log("⏳ Checking for topics older than 30 days...");
    const oldTopicsSnap = await db
      .collection("topics")
      .where("createdAt", "<=", thirtyDaysAgo)
      .where("ended", "==", false)
      .get();

    if (oldTopicsSnap.empty) {
      console.log("✅ No topics to end today.");
      return null;
    }

    const batch = db.batch();
    oldTopicsSnap.forEach((doc) => {
      batch.update(doc.ref, { ended: true });
    });

    await batch.commit();
    console.log(`🏁 Ended ${oldTopicsSnap.size} topics.`);
    return null;
  });

/**
 * 🧩 Express endpoint export
 * Enables HTTP routes like /summarizeDebate
 */
exports.api = functions.https.onRequest(app);
