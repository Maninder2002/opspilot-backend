const express = require("express")

const {
  generateChatResponse,
} = require("../controllers/aiController")

const router = express.Router()

router.post("/chat", generateChatResponse)

module.exports = router