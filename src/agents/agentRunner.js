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

const runAgent = async (userPrompt) => {
  const systemPrompt = `
  You are OpsPilot AI.

  You are an AI DevOps Engineer.

  Available Tools:

  ${toolsDescription}

  Tool Selection Rules:

  1. Logs, stack traces, container crashes, PM2 errors, Mongo errors, Linux errors → log_analyzer

  2. Docker Compose, Dockerfile, containerization, Kubernetes basics → docker_generator

  3. Nginx configuration, SSL, reverse proxy, 502/504 issues → nginx_assistant

  4. GitHub Actions, GitLab CI, Jenkins, CI/CD workflows → cicd_generator

  5. VPS deployment, PM2, production deployment, Linux server setup → deployment_assistant

  Examples:

  User:
  Analyze this log:
  Error: connect ECONNREFUSED 127.0.0.1:27017

  Response:
  {
    "type":"tool",
    "tool":"log_analyzer",
    "args":{
      "logContent":"Error: connect ECONNREFUSED 127.0.0.1:27017"
    }
  }

  User:
  Generate Docker Compose for MERN app

  Response:
  {
    "type":"tool",
    "tool":"docker_generator",
    "args":{
      "requirements":"Generate Docker Compose for MERN app"
    }
  }

  User:
  Create GitHub Actions workflow

  Response:
  {
    "type":"tool",
    "tool":"cicd_generator",
    "args":{
      "requirements":"Create GitHub Actions workflow"
    }
  }

  Return ONLY raw JSON.

  Never use markdown.
  Never wrap JSON in backticks.
  `

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
    response.choices?.[0]?.message?.content || ""

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
      response: parsed.content || content,
    }
  }

  if (parsed.type === "tool") {
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
    response: "Unable to process request",
  }
}

module.exports = runAgent
