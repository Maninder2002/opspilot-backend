const readFileContent = require("../utils/readFileContent")
const { generateChatResponse } = require("./aiService")
const runAgent = require("../agents/agentRunner")

const DEVOPS_INTENT_PATTERNS = [
  /analyze.*log/i,
  /log\s*analy/i,
  /docker\s*compose/i,
  /dockerfile/i,
  /\bnginx\b/i,
  /github\s*actions/i,
  /gitlab\s*ci/i,
  /\bci\/cd\b/i,
  /\bjenkins\b/i,
  /reverse\s*proxy/i,
  /\b502\b|\b504\b/,
  /stack\s*trace/i,
  /ECONNREFUSED/i,
  /container\s*(crash|exit)/i,
  /pm2/i,
  /kubernetes|k8s/i,
  /deploy(ment)?/i,
]

const needsAgentMode = (
  message,
  hasAttachments
) => {
  if (hasAttachments) {
    return true
  }

  return DEVOPS_INTENT_PATTERNS.some(
    (pattern) => pattern.test(message)
  )
}

const buildPromptWithAttachments = (
  message,
  attachments
) => {
  let attachmentsContext = ""

  for (const file of attachments) {
    try {
      const content = readFileContent(
        file.path
      )

      attachmentsContext += `
===============================
FILE: ${file.filename}
===============================

${content}

`
    } catch (error) {
      console.error(
        "Failed to read file:",
        file.filename,
        error
      )
    }
  }

  return `
User Question:

${message}

Attached Files:

${attachmentsContext}
`
}

const replyToChat = async ({
  message,
  history,
  attachments = [],
}) => {
  const hasAttachments =
    attachments.length > 0
  const trimmedMessage = message.trim()

  if (
    !needsAgentMode(
      trimmedMessage,
      hasAttachments
    )
  ) {
    const response =
      await generateChatResponse(history)

    return {
      tool: null,
      response,
    }
  }

  const prompt = hasAttachments
    ? buildPromptWithAttachments(
        trimmedMessage,
        attachments
      )
    : trimmedMessage

  const priorHistory = history.slice(0, -1)

  const agentResponse = await runAgent(
    prompt,
    {
      history: priorHistory,
      hasAttachments,
    }
  )

  return {
    tool: agentResponse.tool || null,
    response:
      agentResponse.response ||
      "No response generated",
  }
}

module.exports = {
  replyToChat,
  needsAgentMode,
}
