/* =====================================================
   GLOBAL CAPTCHA VARIABLES
===================================================== */
let userCaptcha = "";
let adminCaptcha = "";
let regCaptcha = "";
let forgotCaptcha = "";

/* =====================================================
   ON LOAD – GENERATE ALL REQUIRED CAPTCHAS
===================================================== */
window.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("userCaptchaCode")) {
    generateUserCaptcha();
  }
  if (document.getElementById("adminCaptchaCode")) {
    generateAdminCaptcha();
  }
  if (document.getElementById("regCaptchaCode")) {
    generateRegCaptcha();
  }
  if (document.getElementById("forgotCaptchaCode")) {
    generateForgotCaptcha();
  }
});

/* =====================================================
   CAPTCHA GENERATOR (COMMON)
===================================================== */
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/* =====================================================
   USER CAPTCHA
===================================================== */
function generateUserCaptcha() {
  userCaptcha = generateCaptcha();
  document.getElementById("userCaptchaCode").textContent = userCaptcha;
  const input = document.getElementById("userCaptchaInput");
  if (input) input.value = "";
}

/* =====================================================
   ADMIN CAPTCHA
===================================================== */
function generateAdminCaptcha() {
  adminCaptcha = generateCaptcha();
  document.getElementById("adminCaptchaCode").textContent = adminCaptcha;
  const input = document.getElementById("adminCaptchaInput");
  if (input) input.value = "";
}

/* =====================================================
   REGISTER CAPTCHA
===================================================== */
function generateRegCaptcha() {
  regCaptcha = generateCaptcha();
  document.getElementById("regCaptchaCode").textContent = regCaptcha;
  const input = document.getElementById("regCaptchaInput");
  if (input) input.value = "";
}

/* =====================================================
   FORGOT PASSWORD CAPTCHA
===================================================== */
function generateForgotCaptcha() {
  forgotCaptcha = generateCaptcha();
  document.getElementById("forgotCaptchaCode").textContent = forgotCaptcha;
  const input = document.getElementById("forgotCaptchaInput");
  if (input) input.value = "";
}

/* =====================================================
   PASSWORD VISIBILITY TOGGLE
===================================================== */
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

/* =====================================================
   ROUTING HELPER (REPLACES showPage)
===================================================== */
function go(url) {
  window.location.href = url;
}

/* =====================================================
   USER LOGIN HANDLER
===================================================== */
function handleUserLogin(event) {
  event.preventDefault();

  const input = document.getElementById("userCaptchaInput").value;

  if (input.toUpperCase() !== userCaptcha) {
    alert("Invalid security code.");
    generateUserCaptcha();
    return;
  }

  alert("User login successful!");
  // BACKEND AUTH WILL COME HERE
}

/* =====================================================
   ADMIN LOGIN HANDLER
===================================================== */
function handleAdminLogin(event) {
  event.preventDefault();

  const input = document.getElementById("adminCaptchaInput").value;

  if (input.toUpperCase() !== adminCaptcha) {
    alert("Invalid security code.");
    generateAdminCaptcha();
    return;
  }

  alert("Admin login successful!");
  // ADMIN DASHBOARD REDIRECT LATER
}

/* =====================================================
   REGISTER HANDLER
===================================================== */
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&()_+\[\]{};':"\\|,.<>\/?]).{8,}$/;

function handleRegister(event) {
  event.preventDefault();

  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const captchaInput = document.getElementById("regCaptchaInput").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (!passwordRegex.test(password)) {
    alert(
      "Password must have minimum 8 characters, 1 uppercase letter, 1 number and 1 special character."
    );
    return;
  }

  if (captchaInput.toUpperCase() !== regCaptcha) {
    alert("Invalid security code.");
    generateRegCaptcha();
    return;
  }

  alert("Registration successful!");
  go("/login");
}

/* =====================================================
   FORGOT PASSWORD HANDLER
===================================================== */
function handleForgotPassword(event) {
  event.preventDefault();

  const captchaInput = document.getElementById("forgotCaptchaInput").value;

  if (captchaInput.toUpperCase() !== forgotCaptcha) {
    alert("Invalid security code.");
    generateForgotCaptcha();
    return;
  }

  alert("Password reset link sent!");
  go("/login");
}
