const detectTool = (message) => {
    const lowerMessage =
      message.toLowerCase()
  
    if (
      lowerMessage.includes(
        "docker compose"
      ) ||
      lowerMessage.includes(
        "docker-compose"
      )
    ) {
      return "docker"
    }
  
    if (
      lowerMessage.includes(
        "github actions"
      ) ||
      lowerMessage.includes("ci/cd")
    ) {
      return "cicd"
    }
  
    return "chat"
  }
  
  module.exports = detectTool