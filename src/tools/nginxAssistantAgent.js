const {
    generateNginxPrompt,
} = require(
    "./nginxAssistantTool"
)

const {
    generateAIResponse,
} = require(
    "../services/aiService"
)

const nginxAssistant =
    async (issue) => {
        const prompt =
            generateNginxPrompt(
                issue
            )

        return await generateAIResponse(
            prompt
        )
    }

module.exports =
    nginxAssistant