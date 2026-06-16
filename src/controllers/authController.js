const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../models/User")

const validateAuthBody = (
  body,
  isRegister
) => {
  const { name, email, password } = body

  if (!email || !password) {
    return "Email and password are required"
  }

  if (isRegister && !name?.trim()) {
    return "Name is required"
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters"
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return "Invalid email format"
  }

  return null
}

const registerUser = async (req, res) => {
  try {
    const validationError =
      validateAuthBody(req.body, true)

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      })
    }

    const { name, email, password } =
      req.body

    const normalizedEmail = email
      .toLowerCase()
      .trim()

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      })
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    })

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Server error",
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const validationError =
      validateAuthBody(req.body, false)

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      })
    }

    const { email, password } = req.body

    const normalizedEmail = email
      .toLowerCase()
      .trim()

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password")

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    const isPasswordMatch =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Server error",
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
}
