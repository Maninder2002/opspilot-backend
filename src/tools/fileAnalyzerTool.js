const generateFileAnalysisPrompt =
    (
        filename,
        content,
        question
    ) => {
        return `
You are a Senior DevOps Engineer.

File Name:
${filename}

File Content:
${content}

User Question:
${question}

Analyze carefully and provide recommendations.
`
    }

module.exports = {
    generateFileAnalysisPrompt,
}