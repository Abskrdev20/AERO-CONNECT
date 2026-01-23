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

  // ✅ CLEANUP – UX ONLY
  if (!captchaInput) {
    alert("Please enter the security code");
    return;
  }

  fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, captcha: captchaInput })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        alert(data.message);
        refreshCaptcha();
      }
    })
    .catch(() => {
      alert("Server error. Please try again.");
      refreshCaptcha();
    });
}

/* =====================================================
   ADMIN LOGIN HANDLER
===================================================== */
function handleAdminLogin(event) {
  event.preventDefault();

  const captchaInput = document.getElementById("adminCaptchaInput").value;

  // ✅ CLEANUP – UX ONLY
  if (!captchaInput) {
    alert("Please enter the security code");
    return;
  }

  alert("Admin login successful! (Demo)");
  window.location.href = "/admin/dashboard";
}

/* =====================================================
   REGISTER HANDLER
===================================================== */
function handleRegister(event) {
  event.preventDefault();

  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const captchaInput = document.getElementById("regCaptchaInput").value;

  // ✅ CLEANUP – UX ONLY
  if (!captchaInput) {
    alert("Please enter the security code");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: document.querySelector('input[placeholder="Full Name"]').value,
      employeeId: document.querySelector('input[placeholder="EMP ID"]').value,
      email: document.querySelector('input[type="email"]').value,
      mobile: document.querySelector('input[type="tel"]').value,
      position: document.querySelectorAll("select")[0].value,
      department: document.querySelectorAll("select")[1].value,
      password,
      captcha: captchaInput
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Registration successful! Please login.");
        window.location.href = "/login";
      } else {
        alert(data.message);
        refreshCaptcha();
      }
    })
    .catch(() => {
      alert("Server error. Please try again.");
      refreshCaptcha();
    });
}

/* =====================================================
   FORGOT PASSWORD HANDLER
===================================================== */
function handleForgotPassword(event) {
  event.preventDefault();

  const captchaInput = document.getElementById("forgotCaptchaInput").value;

  // ✅ CLEANUP – UX ONLY
  if (!captchaInput) {
    alert("Please enter the security code");
    return;
  }

  alert("Password reset link sent to your official email!");
  go("/login");
}

/* =====================================================
   CAPTCHA REFRESH (COMMON)
===================================================== */
function refreshCaptcha() {
  document.querySelectorAll(".captcha-display").forEach(img => {
    img.src = "/auth/captcha?" + Date.now();
  });
}