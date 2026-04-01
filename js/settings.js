function fillSettingsProfile() {
  const session = getSession();
  document.getElementById("settingsName").textContent = session.fullName;
  document.getElementById("settingsEmail").textContent = session.email;
  document.getElementById("settingsAvatar").textContent = session.fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function setupSettingsControls() {
  const themeToggle = document.getElementById("themeToggle");
  const languageSelect = document.getElementById("languageSelect");
  const locationSelect = document.getElementById("locationPreference");
  const logoutButton = document.getElementById("logoutButton");

  populateLocationOptions(locationSelect, false);

  themeToggle.value = getTheme();
  languageSelect.value = getLanguage();
  locationSelect.value = getPreferredLocation();

  themeToggle.addEventListener("change", () => {
    setTheme(themeToggle.value);
  });

  languageSelect.addEventListener("change", () => {
    setLanguage(languageSelect.value);
    window.location.reload();
  });

  locationSelect.addEventListener("change", () => {
    setPreferredLocation(locationSelect.value);
  });

  logoutButton.addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!ensureProtectedPageAccess()) {
    return;
  }

  fillSettingsProfile();
  setupSettingsControls();
});
