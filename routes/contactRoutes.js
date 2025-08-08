//save contact messages 

const express = require("express");
const router = express.Router();
const Message = require("../models/Contact");

// POST /contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ message: "Message saved successfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
