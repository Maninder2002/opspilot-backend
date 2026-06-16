const path = require("path")
const { findUserChat } = require("../utils/chatHelpers")
const {
  deleteFileSafely,
} = require("../utils/fileCleanup")

const uploadFile = async (req, res) => {
  try {
    const result = await findUserChat(
      req.params.id,
      req.user.id
    )

    if (result.error) {
      if (req.file?.path) {
        await deleteFileSafely(req.file.path)
      }

      return res
        .status(result.status)
        .json({ message: result.message })
    }

    const chat = result.chat

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      })
    }

    chat.attachments.push({
      filename: path.basename(
        req.file.originalname
      ),
      path: req.file.path,
      mimeType: req.file.mimetype,
    })

    await chat.save()

    res.status(200).json({
      success: true,
      attachment:
        chat.attachments[
          chat.attachments.length - 1
        ],
    })
  } catch (error) {
    if (req.file?.path) {
      await deleteFileSafely(req.file.path)
    }

    console.error(error)

    res.status(500).json({
      message: "File upload failed",
    })
  }
}

module.exports = {
  uploadFile,
}
