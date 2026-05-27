const express = require("express")

const upload = require(
  "../config/multer"
)

const {
  analyzeUploadedLog,
} = require(
  "../controllers/uploadController"
)

const router = express.Router()

router.post(
  "/analyze",
  upload.single("file"),
  analyzeUploadedLog
)

module.exports = router