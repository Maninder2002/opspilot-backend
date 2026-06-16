const path = require("path")
const fs = require("fs")
const multer = require("multer")

const uploadDir = path.join(
  __dirname,
  "../uploads"
)

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  })
}

const ALLOWED_EXTENSIONS = new Set([
  ".log",
  ".txt",
  ".json",
  ".yml",
  ".yaml",
  ".csv",
  ".xlsx",
  ".xls",
])

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const safeName = path.basename(
      file.originalname
    )

    cb(
      null,
      `${Date.now()}-${safeName}`
    )
  },
})

const fileFilter = (req, file, cb) => {
  const ext = path
    .extname(file.originalname)
    .toLowerCase()

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error("Invalid file type"),
      false
    )
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

module.exports = upload
