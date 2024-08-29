const express = require("express");
const router = express.Router();
const User = require("../models/users.collection");
const {
  getUsers,
  getUser,
  postUser,
  updateUser,
  deleteUser,
  loginUser,
  verifyToken,
  getCurrentUser,
} = require("../controllers/user.controller");

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", postUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getUser);
router.get("/currentUser", verifyToken, getCurrentUser);
module.exports = router;