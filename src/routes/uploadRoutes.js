const express = require("express")

const authMiddleware = require("../middleware/authMiddleware")
const upload = require("../config/multer")

const { analyzeUploadedLog } = require(
  "../controllers/uploadController"
)

const router = express.Router()

router.use(authMiddleware)

router.post(
  "/analyze",
  upload.single("file"),
  analyzeUploadedLog
)

module.exports = router
