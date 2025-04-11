const express = require("express");
const router = express.Router();
const verifyRecaptcha = require("../controllers/authController");
const { loginUser } = require("../controllers/userController");

router.post("/login", verifyRecaptcha, loginUser);

module.exports = router;
