function handleLogin() {
  const form = document.getElementById("loginForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const users = getUsers();
    const user = users.find((item) => item.email === email && item.password === password);
    const feedback = document.getElementById("authFeedback");

    if (!user) {
      feedback.textContent = "Invalid email or password.";
      feedback.className = "form-feedback error";
      return;
    }

    saveSession({
      fullName: user.fullName,
      email: user.email
    });

    feedback.textContent = "Login successful. Redirecting...";
    feedback.className = "form-feedback success";
    window.setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });
}

function handleSignup() {
  const form = document.getElementById("signupForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fullName = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    const feedback = document.getElementById("authFeedback");
    const users = getUsers();

    if (!fullName || !email || !password) {
      feedback.textContent = "Please fill in all required fields.";
      feedback.className = "form-feedback error";
      return;
    }

    if (password !== confirmPassword) {
      feedback.textContent = "Passwords do not match.";
      feedback.className = "form-feedback error";
      return;
    }

    if (users.some((user) => user.email === email)) {
      feedback.textContent = "This email is already registered.";
      feedback.className = "form-feedback error";
      return;
    }

    users.push({ fullName, email, password });
    saveUsers(users);
    saveSession({ fullName, email });

    feedback.textContent = "Account created successfully.";
    feedback.className = "form-feedback success";
    window.setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "login") {
    ensureAuthPageAccess();
    handleLogin();
  }

  if (document.body.dataset.page === "signup") {
    ensureAuthPageAccess();
    handleSignup();
  }
});
