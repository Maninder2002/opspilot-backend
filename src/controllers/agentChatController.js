const runAgent = require(
    "../agents/agentRunner"
  )
  
  const agentChat = async (
    req,
    res
  ) => {
    try {
      const { message } =
        req.body
  
      const result =
        await runAgent(message)
  
      res.json(result)
    } catch (error) {
      console.error(error)
  
      res.status(500).json({
        message:
          "Agent failed",
      })
    }
  }
  
  module.exports = {
    agentChat,
  }