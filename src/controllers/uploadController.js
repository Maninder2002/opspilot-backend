const fs = require("fs")

const {
  generateAIResponse,
} = require("../services/aiService")

const {
  generateLogAnalysisPrompt,
} = require("../tools/logAnalyzerTool")

const analyzeUploadedLog = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      })
    }

    const fileContent =
      fs.readFileSync(
        req.file.path,
        "utf-8"
      )

    const prompt =
      generateLogAnalysisPrompt(
        fileContent
      )

    const response =
      await generateAIResponse(prompt)

    res.status(200).json({
      filename:
        req.file.originalname,
      analysis: response,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message:
        "Log analysis failed",
    })
  }
}

module.exports = {
  analyzeUploadedLog,
}