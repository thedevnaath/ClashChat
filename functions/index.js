const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

// OpenAI key from Firebase env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,  // pull directly from GitHub secret
});

// Summarize debate
app.post("/summarizeDebate", async (req, res) => {
  try {
    const { topicId } = req.body;

    const topicDoc = await db.collection("topics").doc(topicId).get();
    if (!topicDoc.exists) return res.status(404).send("Topic not found");

    const topic = topicDoc.data();

    const messagesSnap = await db.collection("messages")
      .where("topicId", "==", topicId)
      .orderBy("timestamp")
      .get();

    const messages = messagesSnap.docs.map(doc => doc.data());

    const prompt = `
Topic: ${topic.topicText}
Debate Messages:
${messages.map(m => `${m.voteSide}: ${m.messageText}`).join("\n")}
Summarize the debate and decide the winning side (Agree or Disagree).
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = completion.choices[0].message.content;

    await db.collection("results").doc(topicId).set({ summary });

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating summary");
  }
});

// Auto end topics daily
exports.dailyTopicUpdate = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  const now = new Date();
  const topicsRef = db.collection("topics");
  const activeSnap = await topicsRef.where("status", "==", "active").get();

  activeSnap.forEach(async doc => {
    const data = doc.data();
    if (new Date(data.endDate) <= now) {
      await doc.ref.update({ status: "ended" });
    }
  });
});

exports.api = functions.https.onRequest(app);
