const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

// ⚙️ OpenAI config - try multiple sources
const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_KEY,
});

/**
 * 📘 Summarize Debate
 */
app.post("/summarizeDebate", async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!topicId) return res.status(400).send("Missing topicId");

    // Get topic
    const topicDoc = await db.collection("topics").doc(topicId).get();
    if (!topicDoc.exists) return res.status(404).send("Topic not found");
    const topic = topicDoc.data();

    // Get messages
    const messagesSnap = await db
      .collection("messages")
      .where("topicId", "==", topicId)
      .orderBy("timestamp")
      .get();

    const messages = messagesSnap.docs.map((doc) => doc.data());

    if (messages.length === 0) {
      return res.status(400).send("No messages found for this topic");
    }

    // Create prompt
    const prompt = `
Topic: ${topic.topicText}

Debate Messages:
${messages.map((m, i) => `${i + 1}. ${m.userName} (${m.side}): ${m.text}`).join("\n")}

---
Analyze this debate and provide:
1. A brief summary of the main arguments from both sides
2. Which side presented stronger arguments
3. Declare the winning side (Agree or Disagree)

Keep it concise (3-4 sentences).
`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const summary = completion.choices[0].message.content;

    // Store result
    await db.collection("results").doc(topicId).set({
      topicId,
      summary,
      topicText: topic.topicText,
      messageCount: messages.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Also update "latest" for easy access
    await db.collection("results").doc("latest").set({
      topicId,
      summary,
      topicText: topic.topicText,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Summary stored for topic: ${topicId}`);
    res.json({ success: true, summary });
  } catch (err) {
    console.error("❌ Error in summarizeDebate:", err);
    res.status(500).json({ 
      error: "Error generating summary", 
      details: err.message 
    });
  }
});

/**
 * 🕒 Auto End Old Topics
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
      .where("status", "==", "active")
      .get();

    if (oldTopicsSnap.empty) {
      console.log("✅ No topics to end today.");
      return null;
    }

    const batch = db.batch();
    oldTopicsSnap.forEach((doc) => {
      batch.update(doc.ref, { status: "ended" });
    });

    await batch.commit();
    console.log(`🏁 Ended ${oldTopicsSnap.size} topics.`);
    return null;
  });

/**
 * 🧩 Express endpoint export
 */
exports.api = functions.https.onRequest(app);
