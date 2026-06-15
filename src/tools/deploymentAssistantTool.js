const generateDeploymentPrompt =
    (requirements) => {
        return `
You are a Senior DevOps Engineer.

Generate a deployment guide.

Provide:

1. Server Requirements
2. Installation Commands
3. PM2 Setup
4. Nginx Setup
5. SSL Setup
6. Firewall Setup
7. Deployment Checklist

Requirements:

${requirements}
`
    }

module.exports = {
    generateDeploymentPrompt,
}