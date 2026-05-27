const express = require("express")

const {
  createChat,
  getChats,
  getSingleChat,
  sendMessage,
} = require(
  "../controllers/chatController"
)

const router = express.Router()

router.post("/", createChat)

router.get("/", getChats)

router.get("/:id", getSingleChat)

router.post("/:id/messages", sendMessage)
module.exports = router