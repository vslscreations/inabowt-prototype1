const outingFeed = document.getElementById("outing-feed");
const searchInput = document.getElementById("search-input");
const feedCount = document.getElementById("feed-count");
const detailsModal = document.getElementById("details-modal");
const detailsContent = document.getElementById("details-content");
const createModal = document.getElementById("create-modal");
const categorySelect = document.getElementById("category-select");
const navButtons = document.querySelectorAll("[data-screen]");
const screens = {
  discover: document.getElementById("discover-page"),
  plans: document.getElementById("plans-page"),
  profile: document.getElementById("profile-page")
};

const categories = [
  "All",
  "Food & Drinks",
  "Outdoors",
  "Games",
  "Entertainment",
  "Arts & Culture",
  "Unique Experiences"
];

const outingTypeMeta = {
  OPEN_OUTING: {
    label: "Open Outing",
    description: "Open to everyone. No invitation necessary."
  },
  PUBLIC_OUTING: {
    label: "Public Outing",
    description: "Express interest. Get selected. Join the experience."
  }
};

const state = {
  activeCategory: "All",
  activeType: "OPEN_OUTING",
  searchTerm: "",
  participationStatus: {}
};

function normalizeOutingType(outing) {
  const rawType = outing.outingType || outing.participationType || "OPEN_OUTING";
  return String(rawType).replace(/\s+/g, "_").toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function setMediaBackground(element, imageValue, fallbackValue) {
  const value = String(imageValue || "").trim();
  const fallback = fallbackValue || "linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))";

  if (!value) {
    element.style.backgroundImage = fallback;
    return;
  }

  element.style.backgroundImage = value;

  if (!value.startsWith("url(")) return;

  const match = value.match(/url\((['"]?)(.*?)\1\)/i);
  const source = match ? match[2] : "";

  if (!source) return;

  const image = new Image();
  image.onerror = () => {
    element.style.backgroundImage = fallback;
  };
  image.src = source;
}

function getVisibleOutings() {
  return outings.filter((outing) => {
    const outingType = normalizeOutingType(outing);
    const matchesType = outingType === state.activeType;
    const matchesCategory =
      state.activeCategory === "All" || outing.category === state.activeCategory;
    const haystack = `${outing.title} ${outing.location} ${outing.description} ${outing.category} ${outing.creatorName}`.toLowerCase();
    const matchesSearch = haystack.includes(state.searchTerm.toLowerCase());

    return matchesType && matchesCategory && matchesSearch;
  });
}

function getTypeBadgeClasses(type) {
  return type === "OPEN_OUTING" ? "type-badge open" : "type-badge public";
}

function renderTypeToggle() {
  document.querySelectorAll(".outing-type-option").forEach((button) => {
    const isActive = button.dataset.outingType === state.activeType;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function renderOutings() {
  const visibleOutings = getVisibleOutings();
  const mediaFallback = "linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))";

  feedCount.textContent = `${visibleOutings.length} outing${visibleOutings.length === 1 ? "" : "s"}`;

  if (!visibleOutings.length) {
    outingFeed.innerHTML = `
      <div class="placeholder-panel no-results" style="grid-column: 1 / -1; max-width: 100%;">
        <p class="eyebrow">No matches</p>
        <h2>Nothing matches that filter yet.</h2>
        <p>Try a different category, keyword, or switch to the other outing type to keep exploring.</p>
      </div>
    `;
    return;
  }

  outingFeed.innerHTML = visibleOutings
    .map((outing) => {
      const outingType = normalizeOutingType(outing);
      const badgeRow = `
        <div class="badge-row">
          <span class="category-badge">${outing.category}</span>
          <span class="${getTypeBadgeClasses(outingType)}">${outingTypeMeta[outingType].label}</span>
          ${outing.curated && outingType === "OPEN_OUTING" ? '<span class="curated-badge">Curated By Inabowt</span>' : ""}
        </div>
      `;

      const creatorRow = outingType === "PUBLIC_OUTING"
        ? `<li><span class="meta-label">Creator</span> ${outing.creatorName}</li>`
        : "";

      return `
        <article class="outing-card" data-id="${outing.id}" tabindex="0" aria-label="Open details for ${outing.title}">
          <div class="card-media" data-image="${outing.image}" data-fallback="${mediaFallback}" style="background-image: ${outing.image};"></div>
          <div class="card-body">
            ${badgeRow}
            <h3>${outing.title}</h3>
            <ul class="meta-list">
              <li><span class="meta-label">When</span> ${formatDate(outing.date)}</li>
              <li><span class="meta-label">Where</span> ${outing.location}</li>
              ${creatorRow}
            </ul>
            <p class="outing-description">${outing.description}</p>
            <div class="card-footer">
              <span class="status-pill">${outingTypeMeta[outingType].label}</span>
              <button class="card-link" type="button">View details</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  outingFeed.querySelectorAll(".card-media").forEach((media) => {
    setMediaBackground(media, media.dataset.image, media.dataset.fallback);
  });

  outingFeed.querySelectorAll(".outing-card").forEach((card) => {
    card.addEventListener("click", () => {
      openEventDetails(card.dataset.id);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEventDetails(card.dataset.id);
      }
    });
  });
}

function openEventDetails(id) {
  const event = outings.find((outing) => outing.id === id);
  if (!event) return;

  const outingType = normalizeOutingType(event);
  const activeStatus = state.participationStatus[id];
  const actionText = outingType === "OPEN_OUTING"
    ? activeStatus === "JOINED" ? "Joined" : "Join outing"
    : activeStatus === "INTERESTED" ? "Interest recorded" : "Express interest";
  const mediaFallback = "linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))";

  detailsContent.innerHTML = `
    <div class="detail-content">
      <div class="detail-media" data-image="${event.image}" data-fallback="${mediaFallback}" style="background-image: ${event.image};"></div>
      <div class="detail-header">
        <span class="category-badge">${event.category}</span>
        <span class="${getTypeBadgeClasses(outingType)}">${outingTypeMeta[outingType].label}</span>
        ${event.curated && outingType === "OPEN_OUTING" ? '<span class="curated-badge">Curated By Inabowt</span>' : ""}
      </div>
      <h2 id="details-title" class="detail-title">${event.title}</h2>
      <p class="detail-description">${event.description}</p>
      <div class="detail-grid">
        <div class="detail-item">
          <span>When</span>
          <strong>${formatDate(event.date)}</strong>
        </div>
        <div class="detail-item">
          <span>Location</span>
          <strong>${event.location}</strong>
        </div>
        <div class="detail-item">
          <span>Estimated Budget</span>
          <strong>${event.budget}</strong>
        </div>
        <div class="detail-item">
          <span>Participation</span>
          <strong>${outingTypeMeta[outingType].label}</strong>
        </div>
      </div>
      ${outingType === "PUBLIC_OUTING" ? `
        <div class="detail-item creator-block">
          <span>Hosted by</span>
          <strong>${event.creatorName}</strong>
        </div>
      ` : ""}
      <div class="detail-tags">
        ${event.tags.map((tag) => `<span class="detail-tag">${tag}</span>`).join("")}
      </div>
      <div class="detail-actions">
        <button class="primary-button" type="button" id="prototype-interaction-button" data-event-id="${event.id}">${actionText}</button>
        <button class="secondary-button" type="button" data-close-modal="details-modal">Close</button>
      </div>
      <p class="detail-note">
        ${outingType === "PUBLIC_OUTING"
          ? "Prototype interaction only: expressing interest does not guarantee selection or attendance."
          : "Prototype interaction only: joining this outing updates your participation status in the demo."}
      </p>
    </div>
  `;

  const detailMedia = detailsContent.querySelector(".detail-media");
  if (detailMedia) {
    setMediaBackground(detailMedia, detailMedia.dataset.image, detailMedia.dataset.fallback);
  }

  const interactionButton = document.getElementById("prototype-interaction-button");
  if (interactionButton) {
    interactionButton.addEventListener("click", () => {
      const status = outingType === "OPEN_OUTING" ? "JOINED" : "INTERESTED";
      state.participationStatus[event.id] = status;
      interactionButton.textContent = outingType === "OPEN_OUTING" ? "Joined" : "Interest recorded";
      interactionButton.disabled = true;
      interactionButton.style.opacity = "0.8";
    });
  }

  detailsModal.classList.remove("hidden");
  detailsModal.setAttribute("aria-hidden", "false");
}

function closeDetailsModal() {
  detailsModal.classList.add("hidden");
  detailsModal.setAttribute("aria-hidden", "true");
}

function closeCreateModal() {
  createModal.classList.add("hidden");
  createModal.setAttribute("aria-hidden", "true");
}

function setActiveScreen(screenName) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle("is-active", key === screenName);
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.screen === screenName;
    button.classList.toggle("is-active", isActive);
  });
}

function handleOpenCreatePlaceholder() {
  createModal.classList.remove("hidden");
  createModal.setAttribute("aria-hidden", "false");
}

searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value.trim();
  renderOutings();
});

categorySelect.addEventListener("change", (event) => {
  state.activeCategory = event.target.value;
  renderOutings();
});

document.querySelectorAll(".outing-type-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeType = button.dataset.outingType;
    renderTypeToggle();
    renderOutings();
  });
});

document.getElementById("open-create-placeholder").addEventListener("click", handleOpenCreatePlaceholder);

document.addEventListener("click", (event) => {
  const screenTrigger = event.target.closest("[data-screen]");
  if (screenTrigger) {
    setActiveScreen(screenTrigger.dataset.screen);
    return;
  }

  const closeTrigger = event.target.closest("[data-close-modal]");
  if (!closeTrigger) return;

  const modalId = closeTrigger.dataset.closeModal;
  if (modalId === "details-modal") closeDetailsModal();
  if (modalId === "create-modal") closeCreateModal();
});

renderTypeToggle();
renderOutings();
setActiveScreen("discover");
