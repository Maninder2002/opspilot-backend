const {
    generateLogAnalysisPrompt,
  } = require("./logAnalyzerTool")
  
  const {
    generateAIResponse,
  } = require("../services/aiService")
  
  const analyzeLogs = async (
    logContent
  ) => {
    const prompt =
      generateLogAnalysisPrompt(
        logContent
      )
  
    return await generateAIResponse(
      prompt
    )
  }
  
  module.exports = analyzeLogs