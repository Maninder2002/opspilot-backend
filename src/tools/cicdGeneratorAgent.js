const {
    generateCICDPrompt,
  } = require("./cicdGeneratorTool")
  
  const {
    generateAIResponse,
  } = require("../services/aiService")
  
  const generateCICD =
    async (requirements) => {
      const prompt =
        generateCICDPrompt(
          requirements
        )
  
      return await generateAIResponse(
        prompt
      )
    }
  
  module.exports =
    generateCICD