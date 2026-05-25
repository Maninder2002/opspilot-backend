const {
    generateAIResponse,
  } = require("../services/aiService")
  
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
  
      const response =
        await generateAIResponse(message)
  
      res.status(200).json({
        response,
      })
    } catch (error) {
      console.error(error)
  
      res.status(500).json({
        message: "AI generation failed",
      })
    }
  }
  
  module.exports = {
    generateChatResponse,
  }