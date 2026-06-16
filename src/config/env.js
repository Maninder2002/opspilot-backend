const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "GEMINI_API_KEY",
]

const validateEnv = () => {
  const missing = required.filter(
    (key) => !process.env[key]
  )

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    )
    process.exit(1)
  }
}

module.exports = { validateEnv }
