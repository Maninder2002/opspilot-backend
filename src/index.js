const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const aiRoutes = require("./routes/aiRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const chatRoutes = require("./routes/chatRoutes")
const agentChatRoutes = require("./routes/agentChatRoutes")

dotenv.config()

connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/agent", agentChatRoutes)

app.get("/", (req, res) => {
  res.json({
    message: "OpsPilot AI Backend Running",
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})