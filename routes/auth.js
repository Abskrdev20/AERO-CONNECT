const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { generateCaptchaText, generateCaptchaSVG } = require("../utils/captcha");

router.get("/captcha", (req, res) => {
  const captchaText = generateCaptchaText();
  req.session.captcha = captchaText;

  const svg = generateCaptchaSVG(captchaText);

  res.type("svg");
  res.send(svg);
});

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;