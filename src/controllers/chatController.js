const Chat = require("../models/Chat")

const {
    streamAIResponse,
} = require("../services/aiService")

const runAgent = require(
    "../agents/agentRunner"
)

const readFileContent = require(
    "../utils/readFileContent"
)

const createChat = async (
    req,
    res
) => {
    try {
        const chat = await Chat.create({
            title: "New Chat",
            messages: [],
        })

        res.status(201).json(chat)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message:
                "Failed to create chat",
        })
    }
}

const getChats = async (
    req,
    res
) => {
    try {
        const chats = await Chat.find()
            .sort({
                updatedAt: -1,
            })

        res.status(200).json(chats)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message:
                "Failed to fetch chats",
        })
    }
}

const getSingleChat = async (
    req,
    res
) => {
    try {
        const chat = await Chat.findById(
            req.params.id
        )

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
            })
        }

        res.status(200).json(chat)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message:
                "Failed to fetch chat",
        })
    }
}

const sendMessage = async (
    req,
    res
) => {
    try {
        const { message } = req.body

        const chat =
            await Chat.findById(
                req.params.id
            )

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
            })
        }

        chat.messages.push({
            role: "user",
            content: message,
        })

        await chat.save()

        let prompt = message

        // Multi-file context
        if (
            chat.attachments &&
            chat.attachments.length > 0
        ) {
            let attachmentsContext = ""

            for (const file of chat.attachments) {
                try {
                    const content =
                        readFileContent(
                            file.path
                        )

                    attachmentsContext += `
  ================================
  FILE: ${file.filename}
  ================================
  
  ${content}
  
  `
                } catch (error) {
                    console.error(
                        "Failed to read file:",
                        file.filename,
                        error
                    )
                }
            }

            prompt = `
  User Question:
  
  ${message}
  
  Attached Files:
  
  ${attachmentsContext}
  `
        }

        const agentResponse =
            await runAgent(prompt)

        const result =
            agentResponse?.response ||
            "No response generated"

        const tool =
            agentResponse?.tool ||
            null

        chat.messages.push({
            role: "assistant",
            tool,
            content: result,
        })

        if (
            chat.title ===
            "New Chat"
        ) {
            chat.title =
                message.length > 40
                    ? `${message.slice(
                        0,
                        40
                    )}...`
                    : message
        }

        await chat.save()

        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        )

        res.setHeader(
            "Transfer-Encoding",
            "chunked"
        )

        const payload = JSON.stringify({
            tool,
            response: result,
        })

        const chunks =
            payload.match(
                /.{1,50}/gs
            ) || []

        for (const chunk of chunks) {
            res.write(chunk)

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        15
                    )
            )
        }

        res.end()
    } catch (error) {
        console.error(
            "Send Message Error:",
            error
        )

        res.status(500).json({
            message:
                "Failed to process message",
        })
    }
}

const deleteChat = async (
    req,
    res
) => {
    try {
        const chat =
            await Chat.findByIdAndDelete(
                req.params.id
            )

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
            })
        }

        res.status(200).json({
            message:
                "Chat deleted successfully",
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message:
                "Failed to delete chat",
        })
    }
}

const renameChat = async (
    req,
    res
) => {
    try {
        const { title } = req.body

        const chat =
            await Chat.findByIdAndUpdate(
                req.params.id,
                {
                    title,
                },
                {
                    new: true,
                }
            )

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
            })
        }

        res.status(200).json(chat)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message:
                "Failed to rename chat",
        })
    }
}

module.exports = {
    createChat,
    getChats,
    getSingleChat,
    sendMessage,
    deleteChat,
    renameChat,
}