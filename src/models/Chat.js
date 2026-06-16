const mongoose = require("mongoose")

const messageSchema =
  new mongoose.Schema(
    {
      role: {
        type: String,
        enum: [
          "user",
          "assistant",
        ],
        required: true,
      },

      tool: {
        type: String,
        default: null,
      },

      content: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  )

const attachmentSchema =
  new mongoose.Schema(
    {
      filename: {
        type: String,
        required: true,
      },

      path: {
        type: String,
        required: true,
      },

      mimeType: {
        type: String,
      },

      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  )

const chatSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      title: {
        type: String,
        default: "New Chat",
      },

      messages: [
        messageSchema,
      ],

      attachments: [
        attachmentSchema,
      ],
    },
    {
      timestamps: true,
    }
  )

module.exports = mongoose.model(
  "Chat",
  chatSchema
)
