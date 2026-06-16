const Chat = require("../models/Chat")
const { isValidObjectId } = require("./validateObjectId")

const findUserChat = async (chatId, userId) => {
  if (!isValidObjectId(chatId)) {
    return {
      error: true,
      status: 400,
      message: "Invalid chat id",
    }
  }

  const chat = await Chat.findOne({
    _id: chatId,
    user: userId,
  })

  if (!chat) {
    return {
      error: true,
      status: 404,
      message: "Chat not found",
    }
  }

  return { chat }
}

module.exports = { findUserChat }
