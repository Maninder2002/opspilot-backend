const generateNginxPrompt = (
    issue
) => {
    return `
  You are a Senior DevOps Engineer.
  
  Help with the following Nginx problem.
  
  Provide:
  
  1. Explanation
  2. Recommended Configuration
  3. Commands
  4. Troubleshooting Steps
  5. Best Practices
  
  Issue:
  
  ${issue}
  `
}

module.exports = {
    generateNginxPrompt,
}