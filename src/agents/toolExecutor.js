const analyzeLogs = require(
    "../tools/logAnalyzerAgent"
)

const generateDocker = require(
    "../tools/dockerGeneratorAgent"
)

const nginxAssistant = require(
    "../tools/nginxAssistantAgent"
)

const deploymentAssistant =
    require(
        "../tools/deploymentAssistantAgent"
    )

const generateCICD = require(
    "../tools/cicdGeneratorAgent"
)

const fileAnalyzer = require(
    "../tools/fileAnalyzerAgent"
)

const executeTool = async (
    tool,
    args
) => {
    switch (tool) {
        case "log_analyzer":
            return await analyzeLogs(
                args.logContent
            )

        case "docker_generator":
            return await generateDocker(
                args.requirements
            )

        case "nginx_assistant":
            return await nginxAssistant(
                args.issue
            )

        case "deployment_assistant":
            return await deploymentAssistant(
                args.requirements
            )
            
        case "cicd_generator":
            return await generateCICD(
                args.requirements
            )

        case "file_analyzer":
            return await fileAnalyzer(
                args.filename,
                args.content,
                args.question
            )

        default:
            return {
                success: false,
                error:
                    "Unknown tool",
            }
    }
}

module.exports = executeTool