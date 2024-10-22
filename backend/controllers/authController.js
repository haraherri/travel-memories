const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

const registerController = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({
      $or: [{ email: email || "" }, { username: username || "" }],
    });

    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError("Invalid credentials", 401);
    }

    const { password: _, ...userData } = user.toObject();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000,
    });

    res.status(200).json({ user: userData });
  } catch (error) {
    next(error);
  }
};
const getAllUsersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("-password")
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    next(error);
  }
};

const getUserController = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new CustomError("User not found!", 404);
    }
    res.status(200).json({ user: user });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  registerController,
  loginController,
  getAllUsersController,
  getUserController,
};
