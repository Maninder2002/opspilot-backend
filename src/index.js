require("dotenv").config()

const { validateEnv } = require("./config/env")
validateEnv()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const chatRoutes = require("./routes/chatRoutes")
const notFound = require("./middleware/notFound")
const errorHandler = require("./middleware/errorHandler")
const {
  startUploadCleanupScheduler,
} = require("./utils/fileCleanup")

const app = express()

const corsOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) =>
      s.trim()
    )
  : ["http://localhost:3000"]

app.use(helmet())
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
)
app.use(express.json({ limit: "1mb" }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many requests, please try again later",
  },
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many requests, please try again later",
  },
})

app.use("/api/auth", authLimiter, authRoutes)
app.use("/api/upload", apiLimiter, uploadRoutes)
app.use("/api/chats", apiLimiter, chatRoutes)

app.get("/", (req, res) => {
  res.json({
    message: "OpsPilot AI Backend Running",
  })
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()

  startUploadCleanupScheduler()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
