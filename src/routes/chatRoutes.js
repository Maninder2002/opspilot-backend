const express = require("express")

const authMiddleware = require("../middleware/authMiddleware")

const {
  createChat,
  getChats,
  getSingleChat,
  sendMessage,
  deleteChat,
  renameChat,
} = require("../controllers/chatController")

const upload = require("../config/multer")

const { uploadFile } = require(
  "../controllers/chatUploadController"
)

const router = express.Router()

router.use(authMiddleware)

router.post("/", createChat)
router.get("/", getChats)
router.get("/:id", getSingleChat)
router.post("/:id/messages", sendMessage)
router.delete("/:id", deleteChat)
router.patch("/:id", renameChat)
router.post(
  "/:id/upload",
  upload.single("file"),
  uploadFile
)

module.exports = router
