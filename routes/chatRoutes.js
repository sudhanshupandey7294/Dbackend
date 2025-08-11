const express = require('express');
const router = express.Router();
const { CohereClient } = require('cohere-ai');
const Conversation = require('../models/Conversation');

// ✅ Use `token` not `apiKey`
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message required' });
    }

    const sid = sessionId || 'guest_' + (req.ip || 'anon');

    let convo = await Conversation.findOne({ sessionId: sid });
    if (!convo) {
      convo = new Conversation({
        sessionId: sid,
        messages: [
          {
            role: 'system',
            content:
              "You are the support assistant for D-SERVICES. Answer politely and concisely. If user asks for code, show short examples. Always be professional and helpful."
          }
        ]
      });
    }

    convo.messages.push({ role: 'user', content: message });

    const CONTEXT_TURNS = 12;
    const lastMessages = convo.messages.slice(-CONTEXT_TURNS);

    // ✅ Cohere API request
    const chatResponse = await cohere.chat({
      model: process.env.COHERE_MODEL || 'command-r-plus',
      message,
      temperature: 0.6,
      max_tokens: 400
    });

    let assistantText = '';
    if (chatResponse?.text) {
      assistantText = chatResponse.text.trim();
    } else if (chatResponse?.message?.content?.[0]?.text) {
      assistantText = chatResponse.message.content[0].text.trim();
    } else {
      assistantText = 'Sorry, I could not generate a response.';
    }

    convo.messages.push({ role: 'assistant', content: assistantText });
    convo.updatedAt = new Date();
    await convo.save();

    res.json({ reply: assistantText });
  } catch (err) {
    console.error('Chat error:', err.response?.body || err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
