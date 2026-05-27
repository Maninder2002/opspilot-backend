const {
    generateAIResponse,
    streamAIResponse,
  } = require("../services/aiService")
  
  const Chat = require("../models/Chat")

  const detectTool = require(
    "../utils/detectTool"
  )
  
  const {
    generateDockerComposePrompt,
  } = require("../tools/dockerTool")
  
  const generateChatResponse = async (
    req,
    res
  ) => {
    try {
      const { message } = req.body
  
      if (!message) {
        return res.status(400).json({
          message: "Message is required",
        })
      }
  
      const tool = detectTool(message)
  
      let finalPrompt = message
  
      if (tool === "docker") {
        finalPrompt =
          generateDockerComposePrompt(
            message
          )
      }
  
      const response =
        await generateAIResponse(
          finalPrompt
        )


  
      res.status(200).json({
        tool,
        response,
      })
    } catch (error) {
      console.error(error)
  
      res.status(500).json({
        message: "AI generation failed",
      })
    }
  }

  const streamChatResponse = async (
    req,
    res
  ) => {
    try {
      const { message } = req.body
  
      if (!message) {
        return res.status(400).json({
          message: "Message is required",
        })
      }
  
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
        res
      )
    } catch (error) {
      console.error(error)
  
      res.status(500).end()
    }
  }

  const getChatHistory = async (
    req,
    res
  ) => {
    try {
      const chats = await Chat.find()
        .sort({
          createdAt: -1,
        })
        .limit(20)
  
      res.status(200).json(chats)
    } catch (error) {
      console.error(error)
  
      res.status(500).json({
        message:
          "Failed to fetch history",
      })
    }
  }
  
  module.exports = {
    generateChatResponse,
    streamChatResponse,
    getChatHistory,
  }