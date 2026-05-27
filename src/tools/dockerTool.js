const generateDockerComposePrompt = (
    userPrompt
  ) => {
    return `
  You are a senior DevOps engineer.
  
  Generate a production-ready docker-compose.yml
  based on this request:
  
  "${userPrompt}"
  
  Requirements:
  - return only YAML
  - include comments
  - use best practices
  - optimize for production
  - include restart policies
  - include volumes if needed
  `
  }
  
  module.exports = {
    generateDockerComposePrompt,
  }