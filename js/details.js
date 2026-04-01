function getCurrentMatch() {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get("id");
  return getMatches().find((match) => match.id === matchId);
}

function renderMatchDetails() {
  const match = getCurrentMatch();
  const detailsContainer = document.getElementById("detailsContainer");

  if (!match) {
    detailsContainer.innerHTML = `<div class="empty-state">${getTranslation("noMatches")}</div>`;
    return;
  }

  const remaining = Math.max(match.totalNeeded - match.joinedPlayers, 0);
  const session = getSession();
  const alreadyJoined = isJoinedByCurrentUser(match);
  const joinDisabled = remaining <= 0 || alreadyJoined;

  detailsContainer.innerHTML = `
    <section class="details-hero">
      <div>
        <span class="mini-tag">${match.matchType}</span>
        <h1>${match.teamName}</h1>
        <p>${match.fieldName} • ${match.location}</p>
      </div>
      <span class="status-badge ${getStatusClass(match)}">${getStatusLabel(match)}</span>
    </section>
    <section class="details-grid">
      <article class="details-card">
        <h2 data-i18n="detailsTitle">${getTranslation("detailsTitle")}</h2>
        <div class="detail-list">
          <div><span data-i18n="date">${getTranslation("date")}</span><strong>${formatDateLabel(match.date)}</strong></div>
          <div><span data-i18n="time">${getTranslation("time")}</span><strong>${formatTime(match.time)}</strong></div>
          <div><span data-i18n="city">${getTranslation("city")}</span><strong>${match.location}</strong></div>
          <div><span data-i18n="matchStatus">${getTranslation("matchStatus")}</span><strong>${getStatusLabel(match)}</strong></div>
        </div>
        <p class="details-notes">${match.notes || "No notes added."}</p>
      </article>
      <aside class="details-card side-panel">
        <h3>${session.fullName}</h3>
        <div class="progress-row">
          <div><span>${getTranslation("totalNeeded")}</span><strong>${match.totalNeeded}</strong></div>
          <div><span>${getTranslation("joinedPlayersLabel")}</span><strong>${match.joinedPlayers}</strong></div>
          <div><span>${getTranslation("remainingSlots")}</span><strong>${remaining}</strong></div>
        </div>
        <button id="joinMatchButton" class="primary-btn full-width" ${joinDisabled ? "disabled" : ""}>
          ${alreadyJoined ? getTranslation("alreadyJoined") : getTranslation("joinMatch")}
        </button>
      </aside>
    </section>
  `;

  const joinButton = document.getElementById("joinMatchButton");
  if (joinButton) {
    joinButton.addEventListener("click", () => {
      const matches = getMatches();
      const target = matches.find((item) => item.id === match.id);
      const sessionEmail = getCurrentUserEmail();

      if (!target || !sessionEmail || isJoinedByCurrentUser(target) || target.joinedPlayers >= target.totalNeeded) {
        return;
      }

      target.joinedUsers = Array.isArray(target.joinedUsers) ? target.joinedUsers : [];
      target.joinedPlayers += 1;
      target.joinedByUser = true;
      target.joinedUsers.push(sessionEmail);
      saveMatches(matches);
      renderMatchDetails();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!ensureProtectedPageAccess()) {
    return;
  }
  renderMatchDetails();
});
