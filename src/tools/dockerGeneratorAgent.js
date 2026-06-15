const { generateDockerPrompt, } = require("./dockerGeneratorTool")
const { generateAIResponse } = require("../services/aiService")

const generateDocker =
    async (requirements) => {
        const prompt =
            generateDockerPrompt(
                requirements
            )

        return await generateAIResponse(
            prompt
        )
    }

module.exports = generateDocker