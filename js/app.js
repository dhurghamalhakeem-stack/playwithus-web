function renderDashboardStats(matches) {
  const openMatches = matches.filter((match) => match.totalNeeded - match.joinedPlayers > 0);
  const today = new Date().toISOString().slice(0, 10);
  const todaysMatches = matches.filter((match) => match.date === today);
  const joinedMatches = matches.filter((match) => isJoinedByCurrentUser(match));
  const totalPlayersNeeded = openMatches.reduce((sum, match) => sum + (match.totalNeeded - match.joinedPlayers), 0);

  const stats = [
    { label: getTranslation("liveMatches"), value: openMatches.length },
    { label: getTranslation("playersNeeded"), value: totalPlayersNeeded },
    { label: getTranslation("todaysKickoffs"), value: todaysMatches.length },
    { label: getTranslation("joinedCount"), value: joinedMatches.length }
  ];

  const statsContainer = document.getElementById("statsGrid");
  statsContainer.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card">
          <span>${stat.label}</span>
          <strong>${stat.value}</strong>
        </article>
      `
    )
    .join("");
}

function renderMatchSections(matches) {
  const openContainer = document.getElementById("openMatchesGrid");
  const urgentContainer = document.getElementById("urgentMatchesGrid");
  const emptyState = `<div class="empty-state">${getTranslation("noMatches")}</div>`;

  const openMatches = matches.filter((match) => match.totalNeeded - match.joinedPlayers > 0);
  const urgentMatches = openMatches.filter((match) => match.totalNeeded - match.joinedPlayers <= 2);

  openContainer.innerHTML = openMatches.length ? openMatches.map(buildMatchCard).join("") : emptyState;
  urgentContainer.innerHTML = urgentMatches.length ? urgentMatches.map(buildMatchCard).join("") : emptyState;
}

function getDashboardMatches() {
  return getMatches().sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
}

function filterMatches(matches) {
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const quickFilter = document.querySelector(".filter-chip.active")?.dataset.filter || "all";
  const locationValue = document.getElementById("locationFilter").value;
  const typeValue = document.getElementById("typeFilter").value;
  const today = new Date().toISOString().slice(0, 10);

  return matches.filter((match) => {
    const remaining = match.totalNeeded - match.joinedPlayers;
    const matchesSearch =
      match.teamName.toLowerCase().includes(searchTerm) ||
      match.fieldName.toLowerCase().includes(searchTerm);
    const matchesLocation = !locationValue || match.location === locationValue;
    const matchesType = !typeValue || match.matchType === typeValue;

    let matchesQuickFilter = true;
    if (quickFilter === "open") {
      matchesQuickFilter = remaining > 0;
    } else if (quickFilter === "today") {
      matchesQuickFilter = match.date === today;
    } else if (quickFilter === "need-1") {
      matchesQuickFilter = remaining === 1;
    } else if (quickFilter === "need-2-plus") {
      matchesQuickFilter = remaining >= 2;
    }

    return matchesSearch && matchesLocation && matchesType && matchesQuickFilter;
  });
}

function refreshDashboard() {
  const matches = getDashboardMatches();
  const filteredMatches = filterMatches(matches);
  renderDashboardStats(matches);
  renderMatchSections(filteredMatches);
}

function handleCreateRequest() {
  const form = document.getElementById("createRequestForm");
  const feedback = document.getElementById("formFeedback");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const session = getSession();
    const formData = new FormData(form);
    const matches = getMatches();
    const newMatch = {
      id: `match-${Date.now()}`,
      teamName: formData.get("teamName").trim(),
      fieldName: formData.get("fieldName").trim(),
      location: formData.get("location"),
      date: formData.get("date"),
      time: formData.get("time"),
      matchType: formData.get("matchType"),
      notes: formData.get("notes").trim(),
      totalNeeded: Number(formData.get("totalNeeded")),
      joinedPlayers: 0,
      createdByUser: true,
      joinedByUser: false,
      createdByName: session.fullName,
      createdByEmail: session.email,
      joinedUsers: []
    };

    matches.unshift(newMatch);
    saveMatches(matches);
    form.reset();
    feedback.textContent = "Request added successfully.";
    refreshDashboard();
    setTimeout(() => {
      feedback.textContent = "";
    }, 2500);
  });
}

function wireFilters() {
  document.getElementById("searchInput").addEventListener("input", refreshDashboard);
  document.getElementById("locationFilter").addEventListener("change", refreshDashboard);
  document.getElementById("typeFilter").addEventListener("change", refreshDashboard);
  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("locationFilter").value = getPreferredLocation();
    document.getElementById("typeFilter").value = "";
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
    document.querySelector('[data-filter="all"]').classList.add("active");
    refreshDashboard();
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      refreshDashboard();
    });
  });
}

function setupModal() {
  const modal = document.getElementById("createModal");
  const openButtons = document.querySelectorAll("[data-open-modal]");
  const closeButton = document.getElementById("closeModal");

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      modal.classList.add("show");
    });
  });

  closeButton.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("show");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!ensureProtectedPageAccess()) {
    return;
  }

  const session = getSession();
  document.getElementById("heroGreeting").textContent = `${session.fullName.split(" ")[0]}, ${getTranslation("heroTitle")}`;

  populateLocationOptions(document.getElementById("locationFilter"), true);
  populateLocationOptions(document.getElementById("requestLocation"), false);
  populateMatchTypeOptions(document.getElementById("typeFilter"), true);
  populateMatchTypeOptions(document.getElementById("requestMatchType"), false);

  const preferredLocation = getPreferredLocation();
  if (preferredLocation) {
    document.getElementById("locationFilter").value = preferredLocation;
    document.getElementById("requestLocation").value = preferredLocation;
  }

  wireFilters();
  handleCreateRequest();
  setupModal();
  refreshDashboard();
});
