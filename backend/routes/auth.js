const express = require("express");
const {
  registerController,
  loginController,
  getUserController,
  getAllUsersController,
} = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

router.post("/create-account", registerController);
router.post("/login", loginController);
router.get("/", verifyToken, getAllUsersController);
router.get("/get-user", verifyToken, getUserController);
module.exports = router;
