const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ⚙️ Supabase config
const supabaseUrl = process.env.SUPABASE_URL || 'https://ohuvrlxzyctjbkzlpfup.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ⚙️ OpenAI config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * 📘 Summarize Debate
 */
app.post('/summarizeDebate', async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!topicId) return res.status(400).send('Missing topicId');

    // Get topic from Supabase
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      return res.status(404).send('Topic not found');
    }

    // Get messages from Supabase
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('topicId', topicId)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      return res.status(500).send('Error fetching messages');
    }

    if (!messages || messages.length === 0) {
      return res.status(400).send('No messages found for this topic');
    }

    // Create prompt
    const prompt = `
Topic: ${topic.topicText}

Debate Messages:
${messages.map((m, i) => `${i + 1}. ${m.userName} (${m.side}): ${m.text}`).join('\n')}

---
Analyze this debate and provide:
1. A brief summary of the main arguments from both sides
2. Which side presented stronger arguments
3. Declare the winning side (Agree or Disagree)

Keep it concise (3-4 sentences).
`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const summary = completion.choices[0].message.content;

    // Store result in Supabase
    const { error: insertError } = await supabase
      .from('results')
      .upsert({
        topicId,
        summary,
        topicText: topic.topicText,
        messageCount: messages.length,
        createdAt: new Date().toISOString(),
      }, {
        onConflict: 'topicId'
      });

    if (insertError) {
      console.error('❌ Error storing result:', insertError);
      return res.status(500).json({ error: 'Error storing summary' });
    }

    console.log(`✅ Summary stored for topic: ${topicId}`);
    res.json({ success: true, summary });
  } catch (err) {
    console.error('❌ Error in summarizeDebate:', err);
    res.status(500).json({ 
      error: 'Error generating summary', 
      details: err.message 
    });
  }
});

/**
 * 🏥 Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ClashChat API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
