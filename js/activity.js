function renderActivityGroup(containerId, matches, emptyKey) {
  const container = document.getElementById(containerId);
  if (!matches.length) {
    container.innerHTML = `<div class="empty-state">${getTranslation(emptyKey)}</div>`;
    return;
  }

  container.innerHTML = matches.map(buildMatchCard).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (!ensureProtectedPageAccess()) {
    return;
  }

  const matches = getMatches();
  const createdMatches = matches.filter((match) => isCreatedByCurrentUser(match));
  const joinedMatches = matches.filter((match) => isJoinedByCurrentUser(match));

  renderActivityGroup("createdMatchesGrid", createdMatches, "emptyCreated");
  renderActivityGroup("joinedMatchesGrid", joinedMatches, "emptyJoined");
});
