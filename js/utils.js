function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedMatchesIfNeeded() {
  const storedMatches = readStorage(PLAYJOIN_STORAGE_KEYS.matches, null);
  if (!storedMatches || !Array.isArray(storedMatches) || storedMatches.length === 0) {
    writeStorage(PLAYJOIN_STORAGE_KEYS.matches, PLAYJOIN_DEFAULT_MATCHES);
  }
}

function getUsers() {
  return readStorage(PLAYJOIN_STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  writeStorage(PLAYJOIN_STORAGE_KEYS.users, users);
}

function getMatches() {
  seedMatchesIfNeeded();
  return readStorage(PLAYJOIN_STORAGE_KEYS.matches, []);
}

function saveMatches(matches) {
  writeStorage(PLAYJOIN_STORAGE_KEYS.matches, matches);
}

function getCurrentUserEmail() {
  return getSession()?.email || "";
}

function getSession() {
  return readStorage(PLAYJOIN_STORAGE_KEYS.session, null);
}

function saveSession(session) {
  writeStorage(PLAYJOIN_STORAGE_KEYS.session, session);
}

function clearSession() {
  localStorage.removeItem(PLAYJOIN_STORAGE_KEYS.session);
}

function getLanguage() {
  return localStorage.getItem(PLAYJOIN_STORAGE_KEYS.language) || "en";
}

function setLanguage(language) {
  localStorage.setItem(PLAYJOIN_STORAGE_KEYS.language, language);
}

function getTheme() {
  return localStorage.getItem(PLAYJOIN_STORAGE_KEYS.theme) || "dark";
}

function setTheme(theme) {
  localStorage.setItem(PLAYJOIN_STORAGE_KEYS.theme, theme);
  applyTheme(theme);
}

function getPreferredLocation() {
  return localStorage.getItem(PLAYJOIN_STORAGE_KEYS.location) || "";
}

function setPreferredLocation(location) {
  localStorage.setItem(PLAYJOIN_STORAGE_KEYS.location, location);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.body.setAttribute("data-theme", theme);
}

function getTranslation(key) {
  const language = getLanguage();
  const pack = PLAYJOIN_TRANSLATIONS[language] || PLAYJOIN_TRANSLATIONS.en;
  return pack[key] || PLAYJOIN_TRANSLATIONS.en[key] || key;
}

function translatePage(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getTranslation(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = getTranslation(element.dataset.i18nPlaceholder);
  });
}

function formatDateLabel(dateString) {
  const matchDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const matchOnly = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  const difference = Math.round((matchOnly - todayOnly) / 86400000);

  if (difference === 0) {
    return getTranslation("today");
  }
  if (difference === 1) {
    return "Tomorrow";
  }

  return matchDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function getStatusLabel(match) {
  const remaining = match.totalNeeded - match.joinedPlayers;
  const today = new Date().toISOString().slice(0, 10);

  if (remaining <= 0) {
    return getTranslation("full");
  }
  if (match.date === today) {
    return getTranslation("today");
  }
  if (remaining === 1) {
    return getTranslation("needOnePlayer");
  }
  if (remaining >= 2) {
    return getTranslation("needTwoPlayers");
  }
  return getTranslation("open");
}

function getStatusClass(match) {
  const remaining = match.totalNeeded - match.joinedPlayers;
  const today = new Date().toISOString().slice(0, 10);

  if (remaining <= 0) {
    return "badge-full";
  }
  if (match.date === today) {
    return "badge-today";
  }
  if (remaining === 1) {
    return "badge-warning";
  }
  return "badge-open";
}

function buildMatchCard(match) {
  const remaining = Math.max(match.totalNeeded - match.joinedPlayers, 0);
  const joinedLabel = getTranslation("joinedPlayersLabel");
  const neededLabel = getTranslation("totalNeeded");
  const remainingLabel = getTranslation("remainingSlots");
  const detailsLabel = getTranslation("details");

  return `
    <article class="match-card">
      <div class="card-topline">
        <span class="mini-tag">${match.matchType}</span>
        <span class="status-badge ${getStatusClass(match)}">${getStatusLabel(match)}</span>
      </div>
      <div class="match-head">
        <h3>${match.teamName}</h3>
        <p>${match.fieldName}</p>
      </div>
      <div class="match-meta">
        <span>${match.location}</span>
        <span>${formatDateLabel(match.date)}</span>
        <span>${formatTime(match.time)}</span>
      </div>
      <div class="match-stats">
        <div>
          <strong>${match.totalNeeded}</strong>
          <span>${neededLabel}</span>
        </div>
        <div>
          <strong>${match.joinedPlayers}</strong>
          <span>${joinedLabel}</span>
        </div>
        <div>
          <strong>${remaining}</strong>
          <span>${remainingLabel}</span>
        </div>
      </div>
      <a class="outline-btn card-link" href="match-details.html?id=${match.id}">${detailsLabel}</a>
    </article>
  `;
}

function isCreatedByCurrentUser(match) {
  const email = getCurrentUserEmail();
  return Boolean(email && match.createdByEmail === email);
}

function isJoinedByCurrentUser(match) {
  const email = getCurrentUserEmail();
  return Boolean(email && Array.isArray(match.joinedUsers) && match.joinedUsers.includes(email));
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const time = new Date();
  time.setHours(Number(hours), Number(minutes), 0, 0);
  return time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function ensureAuthPageAccess() {
  applyTheme(getTheme());
  translatePage();
  if (getSession()) {
    window.location.href = "index.html";
  }
}

function ensureProtectedPageAccess() {
  seedMatchesIfNeeded();
  applyTheme(getTheme());
  if (!getSession()) {
    window.location.href = "login.html";
    return false;
  }
  translatePage();
  hydrateNavigation();
  return true;
}

function hydrateNavigation() {
  const session = getSession();
  if (!session) {
    return;
  }

  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = session.fullName;
  });
}

function populateLocationOptions(select, includeAllOption) {
  if (!select) {
    return;
  }

  if (includeAllOption) {
    select.innerHTML = `<option value="">${getTranslation("allLocations")}</option>`;
  } else {
    select.innerHTML = "";
  }

  PLAYJOIN_LOCATIONS.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    select.appendChild(option);
  });
}

function populateMatchTypeOptions(select, includeAllOption) {
  if (!select) {
    return;
  }

  if (includeAllOption) {
    select.innerHTML = `<option value="">${getTranslation("allTypes")}</option>`;
  } else {
    select.innerHTML = "";
  }

  PLAYJOIN_MATCH_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });
}

function setCurrentYear() {
  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getTheme());
  setCurrentYear();
});
