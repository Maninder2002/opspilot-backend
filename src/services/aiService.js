require("dotenv").config()

const OpenAI = require("openai")

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL:
    "https://generativelanguage.googleapis.com/v1beta/openai/",
})

const generateAIResponse = async (
  prompt
) => {
  try {
    const response =
      await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

    return response.choices[0].message.content
  } catch (error) {
    console.error(error)

    throw new Error(
      "Failed to generate AI response"
    )
  }
}

module.exports = {
  generateAIResponse,
}