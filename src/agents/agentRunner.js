const client = require("../config/aiClient")

const executeTool = require("./toolExecutor")
const toolRegistry = require("./toolRegistry")

const toolsDescription = toolRegistry
  .map(
    (tool) => `
Tool: ${tool.name}
Description: ${tool.description}
Arguments: ${JSON.stringify(tool.args)}
`
  )
  .join("\n")

const buildSystemPrompt = (hasAttachments) => `
You are OpsPilot AI, an AI DevOps Engineer.

Available Tools:

${toolsDescription}

Tool Selection Rules:

1. Logs, stack traces, container crashes, PM2 errors, Mongo errors, Linux errors → log_analyzer
2. Docker Compose, Dockerfile, containerization, Kubernetes basics → docker_generator
3. Nginx configuration, SSL, reverse proxy, 502/504 issues → nginx_assistant
4. GitHub Actions, GitLab CI, Jenkins, CI/CD workflows → cicd_generator
5. VPS deployment, PM2, production deployment, Linux server setup → deployment_assistant
6. file_analyzer → ONLY when the user message includes an "Attached Files" section with real file content

For general conversation, greetings, small talk, or questions you can answer directly:
{"type":"final","response":"your natural reply"}

For DevOps help you can answer without a specialized tool:
{"type":"final","response":"your expert answer"}

When a specialized tool is needed:
{"type":"tool","tool":"tool_name","args":{...}}

IMPORTANT:
- Never treat greetings, typos, or short casual text (e.g. "hello", "hlo", "hi") as logs or file content.
- Never use file_analyzer unless attached file content is present in the message.
- Return ONLY raw JSON. No markdown. No backticks.

Examples:

User: hello
{"type":"final","response":"Hello! How can I help you today?"}

User: Analyze this log: Error: connect ECONNREFUSED 127.0.0.1:27017
{"type":"tool","tool":"log_analyzer","args":{"logContent":"Error: connect ECONNREFUSED 127.0.0.1:27017"}}

User: Generate Docker Compose for MERN app
{"type":"tool","tool":"docker_generator","args":{"requirements":"Generate Docker Compose for MERN app"}}
${hasAttachments ? "\nThe current user message includes attached files. Prefer file_analyzer when analyzing that file content." : ""}
`

const normalizeAgentResult = (
  parsed,
  rawContent
) => {
  if (parsed.type === "final") {
    return {
      type: "final",
      tool: null,
      response: parsed.response,
    }
  }

  if (parsed.type === "text") {
    return {
      type: "final",
      tool: null,
      response:
        parsed.content || rawContent,
    }
  }

  if (typeof parsed.response === "string") {
    return {
      type: "final",
      tool: null,
      response: parsed.response,
    }
  }

  if (typeof parsed.content === "string") {
    return {
      type: "final",
      tool: null,
      response: parsed.content,
    }
  }

  if (typeof parsed.message === "string") {
    return {
      type: "final",
      tool: null,
      response: parsed.message,
    }
  }

  return null
}

const runAgent = async (
  userPrompt,
  { history = [], hasAttachments = false } = {}
) => {
  const systemPrompt =
    buildSystemPrompt(hasAttachments)

  const conversationMessages = history
    .filter(
      (message) =>
        message.role === "user" ||
        message.role === "assistant"
    )
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))

  let response

  try {
    response =
      await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...conversationMessages,
          {
            role: "user",
            content: userPrompt,
          },
        ],
      })
  } catch (error) {
    console.error("Agent API Error:", error)

    if (error?.status === 429) {
      return {
        type: "final",
        tool: null,
        response:
          "OpsPilot AI is currently experiencing high demand. Please try again in a few moments.",
      }
    }

    return {
      type: "final",
      tool: null,
      response:
        "An unexpected error occurred while processing your request.",
    }
  }

  const content =
    response.choices?.[0]?.message?.content ||
    ""

  console.log("\n==============================")
  console.log("AGENT RESPONSE")
  console.log(content)
  console.log("==============================\n")

  let parsed

  try {
    const cleanedContent = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    parsed = JSON.parse(cleanedContent)

    if (!parsed || typeof parsed !== "object") {
      return {
        type: "final",
        tool: null,
        response: content,
      }
    }
  } catch (error) {
    console.log("Agent returned plain text")

    return {
      type: "final",
      tool: null,
      response: content,
    }
  }

  const normalized = normalizeAgentResult(
    parsed,
    content
  )

  if (normalized) {
    return normalized
  }

  if (parsed.type === "tool") {
    if (
      parsed.tool === "file_analyzer" &&
      !hasAttachments
    ) {
      return {
        type: "final",
        tool: null,
        response:
          typeof parsed.response === "string"
            ? parsed.response
            : "Please upload a file if you want me to analyze file content.",
      }
    }

    const result = await executeTool(
      parsed.tool,
      parsed.args || {}
    )

    return {
      type: "final",
      tool: parsed.tool,
      response:
        typeof result === "string"
          ? result
          : JSON.stringify(result, null, 2),
    }
  }

  return {
    type: "final",
    tool: null,
    response:
      content ||
      "I couldn't process that. Please try again.",
  }
}

module.exports = runAgent
