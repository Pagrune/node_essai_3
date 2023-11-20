// routes/messages.js

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Endpoint pour obtenir tous les messages d'une room
router.get('/:room', async (req, res) => {
  try {
    const room = req.params.room;
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
