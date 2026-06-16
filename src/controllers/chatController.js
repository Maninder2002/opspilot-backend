const Chat = require("../models/Chat")
const { findUserChat } = require("../utils/chatHelpers")
const { replyToChat } = require("../services/chatAiService")
const {
  deleteChatAttachmentFiles,
} = require("../utils/fileCleanup")

const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      title: "New Chat",
      messages: [],
      user: req.user.id,
    })

    res.status(201).json(chat)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to create chat",
    })
  }
}

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user.id,
    }).sort({ updatedAt: -1 })

    res.status(200).json(chats)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to fetch chats",
    })
  }
}

const getSingleChat = async (req, res) => {
  try {
    const result = await findUserChat(
      req.params.id,
      req.user.id
    )

    if (result.error) {
      return res
        .status(result.status)
        .json({ message: result.message })
    }

    res.status(200).json(result.chat)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to fetch chat",
    })
  }
}

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body

    if (!message?.trim()) {
      return res.status(400).json({
        message: "Message is required",
      })
    }

    const result = await findUserChat(
      req.params.id,
      req.user.id
    )

    if (result.error) {
      return res
        .status(result.status)
        .json({ message: result.message })
    }

    const chat = result.chat

    chat.messages.push({
      role: "user",
      content: message.trim(),
    })

    await chat.save()

    const history = chat.messages.map(
      (entry) => ({
        role: entry.role,
        content: entry.content,
      })
    )

    const aiResult = await replyToChat({
      message: message.trim(),
      history,
      attachments: chat.attachments || [],
    })

    const responseText = aiResult.response
    const tool = aiResult.tool

    chat.messages.push({
      role: "assistant",
      tool,
      content: responseText,
    })

    if (chat.title === "New Chat") {
      chat.title =
        message.length > 40
          ? `${message.slice(0, 40)}...`
          : message
    }

    await chat.save()

    res.status(200).json({
      tool,
      response: responseText,
    })
  } catch (error) {
    console.error("Send Message Error:", error)

    res.status(500).json({
      message: "Failed to process message",
    })
  }
}

const deleteChat = async (req, res) => {
  try {
    const result = await findUserChat(
      req.params.id,
      req.user.id
    )

    if (result.error) {
      return res
        .status(result.status)
        .json({ message: result.message })
    }

    await deleteChatAttachmentFiles(
      result.chat.attachments || []
    )

    await Chat.findByIdAndDelete(req.params.id)

    res.status(200).json({
      message: "Chat deleted successfully",
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to delete chat",
    })
  }
}

const renameChat = async (req, res) => {
  try {
    const { title } = req.body

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required",
      })
    }

    const result = await findUserChat(
      req.params.id,
      req.user.id
    )

    if (result.error) {
      return res
        .status(result.status)
        .json({ message: result.message })
    }

    result.chat.title = title.trim()
    await result.chat.save()

    res.status(200).json(result.chat)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to rename chat",
    })
  }
}

module.exports = {
  createChat,
  getChats,
  getSingleChat,
  sendMessage,
  deleteChat,
  renameChat,
}
