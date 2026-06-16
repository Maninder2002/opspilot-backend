const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    })
  }

  const token = header.split(" ")[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.user = { id: decoded.id }
    next()
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    })
  }
}

module.exports = authMiddleware
