const Chat = require("../models/Chat")

const {
    streamAIResponse,
  } = require("../services/aiService")

const createChat = async (
  req,
  res
) => {
  try {
    const chat = await Chat.create({
      title: "New Chat",
      messages: [],
    })

    res.status(201).json(chat)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message:
        "Failed to create chat",
    })
  }
}

const getChats = async (
  req,
  res
) => {
  try {
    const chats = await Chat.find()
      .sort({
        updatedAt: -1,
      })

    res.status(200).json(chats)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message:
        "Failed to fetch chats",
    })
  }
}

const getSingleChat = async (
  req,
  res
) => {
  try {
    const chat = await Chat.findById(
      req.params.id
    )

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      })
    }

    res.status(200).json(chat)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message:
        "Failed to fetch chat",
    })
  }
}

const sendMessage = async (
    req,
    res
  ) => {
    try {
      const { message } = req.body
  
      const chat =
        await Chat.findById(
          req.params.id
        )
  
      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
        })
      }
  
      chat.messages.push({
        role: "user",
        content: message,
      })
  
      await chat.save()
  
      res.setHeader(
        "Content-Type",
        "text/plain; charset=utf-8"
      )
  
      res.setHeader(
        "Transfer-Encoding",
        "chunked"
      )
  
      await streamAIResponse(
        message,
        res,
        chat
      )
    } catch (error) {
      console.error(error)
  
      res.status(500).end()
    }
  }

module.exports = {
  createChat,
  getChats,
  getSingleChat,
  sendMessage,
}