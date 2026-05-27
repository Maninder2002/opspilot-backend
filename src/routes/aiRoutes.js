const express = require("express")

const {
  generateChatResponse,
  streamChatResponse,
  getChatHistory,
} = require("../controllers/aiController")

const router = express.Router()

router.post("/chat", generateChatResponse)
router.post("/chat-stream", streamChatResponse)
router.get("/history", getChatHistory)
module.exports = router