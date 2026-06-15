module.exports = [
  {
    name: "log_analyzer",
    description:
      "Analyze logs and identify root causes, fixes and prevention steps",

    args: {
      logContent: "string",
    },
  },

  {
    name: "docker_generator",
    description:
      "Generate Dockerfiles and Docker Compose configurations",

    args: {
      requirements: "string",
    },
  },

  {
    name: "nginx_assistant",
    description:
      "Generate and troubleshoot Nginx configurations",

    args: {
      issue: "string",
    },
  },

  {
    name: "cicd_generator",
    description:
      "Generate CI/CD workflows and deployment pipelines",

    args: {
      requirements: "string",
    },
  },

  {
    name: "deployment_assistant",
    description:
      "Generate VPS deployment plans and server setup instructions",

    args: {
      requirements: "string",
    },
  },
  {
    name: "file_analyzer",
    description:
      "Analyze uploaded files such as logs, docker-compose files, nginx configs, env files and YAML files",
  
    args: {
      filename: "string",
      content: "string",
      question: "string",
    },
  }
]