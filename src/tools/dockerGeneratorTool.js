const generateDockerPrompt = (
    requirements
) => {
    return `
  You are a senior DevOps engineer.
  
  Generate:
  
  1. docker-compose.yml
  2. Dockerfiles
  3. .env.example
  4. Run commands
  5. Best practices
  
  Requirements:
  
  ${requirements}
  `
}

module.exports = {
    generateDockerPrompt,
}