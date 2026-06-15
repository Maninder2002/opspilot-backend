const Chat = require("../models/Chat")

const uploadFile = async (
  req,
  res
) => {
  try {
    const chat =
      await Chat.findById(
        req.params.id
      )

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      })
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      })
    }

    chat.attachments.push({
      filename:
        req.file.originalname,

      path: req.file.path,

      mimeType:
        req.file.mimetype,
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
    console.error(error)

    res.status(500).json({
      message:
        "File upload failed",
    })
  }
}

module.exports = {
  uploadFile,
}