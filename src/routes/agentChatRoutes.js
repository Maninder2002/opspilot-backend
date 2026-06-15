const express = require("express")

const {
  agentChat,
} = require(
  "../controllers/agentChatController"
)

const router = express.Router()

router.post(
  "/chat",
  agentChat
)

module.exports = router