const client = require("../config/aiClient")

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
  streamAIResponse,
}
