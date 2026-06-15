const {
    generateDeploymentPrompt,
  } = require(
    "./deploymentAssistantTool"
  )
  
  const {
    generateAIResponse,
  } = require(
    "../services/aiService"
  )
  
  const deploymentAssistant =
    async (requirements) => {
      const prompt =
        generateDeploymentPrompt(
          requirements
        )
  
      return await generateAIResponse(
        prompt
      )
    }
  
  module.exports =
    deploymentAssistant