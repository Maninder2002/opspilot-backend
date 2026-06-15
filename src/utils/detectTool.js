const detectTool = (
  message
) => {
  const text =
    message.toLowerCase()

  if (
    text.includes("docker")
  ) {
    return "docker_generator"
  }

  if (
    text.includes("nginx")
  ) {
    return "nginx_assistant"
  }

  if (
    text.includes("deploy") ||
    text.includes("vps")
  ) {
    return "deployment_assistant"
  }

  if (
    text.includes("error") ||
    text.includes("exception") ||
    text.includes("trace") ||
    text.includes("log")
  ) {
    return "log_analyzer"
  }

  return null
}

module.exports =
  detectTool