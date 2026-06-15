const {
    generateFileAnalysisPrompt,
  } = require("./fileAnalyzerTool")
  
  const {
    generateAIResponse,
  } = require("../services/aiService")
  
  const fileAnalyzer = async (
    filename,
    content,
    question
  ) => {
    const prompt =
      generateFileAnalysisPrompt(
        filename,
        content,
        question
      )
  
    return await generateAIResponse(
      prompt
    )
  }
  
  module.exports =
    fileAnalyzer