const client = require("../config/aiClient")

const CHAT_SYSTEM_PROMPT = `You are OpsPilot AI, a friendly and knowledgeable DevOps assistant.

You help with logs, Docker, Kubernetes, CI/CD, Nginx, deployments, Linux, and general software operations.

For casual conversation, greetings, and small talk, reply naturally and briefly.
For technical questions, give clear, practical answers.
Stay helpful and conversational unless the user asks for a detailed runbook or config.`

const generateAIResponse = async (prompt) => {
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

const generateChatResponse = async (
  history
) => {
  try {
    const response =
      await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: CHAT_SYSTEM_PROMPT,
          },
          ...history.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      })

    return (
      response.choices[0].message
        .content || "No response generated"
    )
  } catch (error) {
    console.error(error)

    if (error?.status === 429) {
      return "OpsPilot AI is currently experiencing high demand. Please try again in a few moments."
    }

    throw new Error(
      "Failed to generate AI response"
    )
  }
}

const streamAIResponse = async (
  prompt,
  res,
  chat
) => {
  try {
    const stream =
      await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      })

    let aiResponse = ""

    for await (const chunk of stream) {
      const content =
        chunk.choices?.[0]?.delta?.content ||
        ""

      aiResponse += content

      res.write(content)
    }

    chat.messages.push({
      role: "assistant",
      content: aiResponse,
    })

    if (chat.title === "New Chat") {
      chat.title =
        prompt.slice(0, 40) + "..."
    }

    await chat.save()

    res.end()
  } catch (error) {
    console.error(error)

    res.status(500).end()
  }
}

module.exports = {
  generateAIResponse,
  generateChatResponse,
  streamAIResponse,
}
