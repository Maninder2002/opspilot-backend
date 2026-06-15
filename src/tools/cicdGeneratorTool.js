const generateCICDPrompt = (
    requirements
  ) => {
    return `
  You are a Senior DevOps Engineer.
  
  Generate a complete CI/CD pipeline.
  
  Requirements:
  
  ${requirements}
  
  Provide:
  
  1. Workflow file
  2. Explanation
  3. Required secrets
  4. Deployment process
  5. Best practices
  
  Return production-ready code.
  `
  }
  
  module.exports = {
    generateCICDPrompt,
  }