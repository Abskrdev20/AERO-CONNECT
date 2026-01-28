const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const {
  generateCaptchaText,
  generateCaptchaSVG
} = require("../utils/captcha");

router.get("/captcha", (req, res) => {
  const captchaText = generateCaptchaText();
  req.session.captcha = captchaText;

  const svg = generateCaptchaSVG(captchaText);

  res.type("svg");
  res.send(svg);
});


router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.get("/reset-password/:token", (req, res) => {
  res.render("auth/reset", { token: req.params.token });
});

router.post("/reset-password/:token", resetPassword);

module.exports = router;

