// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { CohereClientV2 } = require('cohere-ai'); // Cohere TypeScript SDK
const Conversation = require('../models/Conversation');

const cohere = new CohereClientV2({ apiKey: process.env.COHERE_API_KEY || process.env.CO_API_KEY });

/**
 * POST /api/chat
 * body: { message: string, sessionId?: string }
 *
 * - Stores user message in Conversation
 * - Sends last N messages to Cohere chat API
 * - Stores assistant reply, returns reply
 */
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message required' });
    }

    const sid = sessionId || 'guest_' + (req.ip || 'anon');

    // Load or create conversation
    let convo = await Conversation.findOne({ sessionId: sid });
    if (!convo) {
      convo = new Conversation({
        sessionId: sid,
        messages: [
          {
            role: 'system',
            content:
              "You are the support assistant for D -SERVICES. Answer politely and concisely. If user asks for code, show short examples. Always behave professional and helpful."
          }
        ]
      });
    }

    // Append user message
    convo.messages.push({ role: 'user', content: message });

    // Choose last N messages for context
    const CONTEXT_TURNS = 12; // adjust as needed
    const lastMessages = convo.messages.slice(-CONTEXT_TURNS).map((m) => ({
      role: m.role,
      content: m.content
    }));

    // Call Cohere Chat API
    const chatResponse = await cohere.chat({
      model: process.env.COHERE_MODEL || 'command-a-03-2025',
      messages: lastMessages,
      max_tokens: 400,
      temperature: 0.6
    });

    // Extract assistant text (SDK returns message.content[0].text)
    const assistantText =
      chatResponse?.message?.content?.[0]?.text?.trim?.() ?? 'Sorry, I could not generate a response.';

    // Save assistant response
    convo.messages.push({ role: 'assistant', content: assistantText });
    convo.updatedAt = new Date();
    await convo.save();

    res.json({ reply: assistantText });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
