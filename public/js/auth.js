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
  if (document.getElementById("userCaptchaCode")) generateUserCaptcha();
  if (document.getElementById("adminCaptchaCode")) generateAdminCaptcha();
  if (document.getElementById("regCaptchaCode")) generateRegCaptcha();
  if (document.getElementById("forgotCaptchaCode")) generateForgotCaptcha();
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

function generateUserCaptcha() {
  userCaptcha = generateCaptcha();
  document.getElementById("userCaptchaCode").textContent = userCaptcha;
  document.getElementById("userCaptchaInput").value = "";
}

function generateAdminCaptcha() {
  adminCaptcha = generateCaptcha();
  document.getElementById("adminCaptchaCode").textContent = adminCaptcha;
  document.getElementById("adminCaptchaInput").value = "";
}

function generateRegCaptcha() {
  regCaptcha = generateCaptcha();
  document.getElementById("regCaptchaCode").textContent = regCaptcha;
  document.getElementById("regCaptchaInput").value = "";
}

function generateForgotCaptcha() {
  forgotCaptcha = generateCaptcha();
  document.getElementById("forgotCaptchaCode").textContent = forgotCaptcha;
  document.getElementById("forgotCaptchaInput").value = "";
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
   ROUTING HELPER
===================================================== */
function go(url) {
  window.location.href = url;
}

/* =====================================================
   USER LOGIN HANDLER
===================================================== */
function handleUserLogin(event) {
  event.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const password = document.getElementById("userLoginPassword").value;
  const captchaInput = document.getElementById("userCaptchaInput").value;

  if (captchaInput.toUpperCase() !== userCaptcha) {
    alert("Invalid security code.");
    generateUserCaptcha();
    return;
  }

  fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Login successful!");
        window.location.href = "/dashboard";
      } else {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error. Please try again.");
    });
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
  
  alert("Admin login successful! (Redirecting to Admin Dashboard...)");
  window.location.href = "/admin/dashboard";
}

/* =====================================================
   REGISTER HANDLER
===================================================== */
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&()_+\[\]{};':"\\|,.<>\/?]).{8,}$/;

function handleRegister(event) {
  event.preventDefault();

  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const captchaInput = document.getElementById("regCaptchaInput").value;
  const position = document.querySelector("select[required]").value; // Get selected position

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (!passwordRegex.test(password)) {
    alert("Password must have minimum 8 characters, 1 uppercase letter, 1 number and 1 special character.");
    return;
  }

  if (captchaInput.toUpperCase() !== regCaptcha) {
    alert("Invalid security code.");
    generateRegCaptcha();
    return;
  }
  fetch("/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    fullName: document.querySelector('input[placeholder="Full Name"]').value,
    employeeId: document.querySelector('input[placeholder="EMP ID"]').value,
    email: document.querySelector('input[type="email"]').value,
    mobile: document.querySelector('input[type="tel"]').value,
    position: document.querySelectorAll("select")[0].value,
    department: document.querySelectorAll("select")[1].value,
    password
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    alert("Registration successful! Please login.");
    window.location.href = "/login";
  } else {
    alert(data.message);
  }
})
.catch(err => {
  console.error(err);
  alert("Server error. Please try again.");
});

  // --- REGISTRATION SUCCESS LOGIC ---
  // Works for ANY position selected
  alert(`Registration Successful for position: ${position}\nPlease login to continue.`);
  window.location.href = "/login";
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

  alert("Password reset link sent to your official email!");
  go("/login");
}