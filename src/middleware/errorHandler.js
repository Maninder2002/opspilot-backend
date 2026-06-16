const multer = require("multer")

const errorHandler = (err, req, res, next) => {
  console.error(err)

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large (max 5MB)",
      })
    }

    return res.status(400).json({
      message: err.message,
    })
  }

  if (err.message === "Invalid file type") {
    return res.status(400).json({
      message: err.message,
    })
  }

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  })
}

module.exports = errorHandler
