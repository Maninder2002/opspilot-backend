const generateLogAnalysisPrompt = (
    logContent
  ) => {
    return `
  You are a senior DevOps engineer.
  
  Analyze the following logs carefully.
  
  Provide:
  1. Root cause
  2. Problem explanation
  3. Fix steps
  4. Prevention tips
  
  Logs:
  
  ${logContent}
  `
  }
  
  module.exports = {
    generateLogAnalysisPrompt,
  }