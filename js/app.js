const filterRow = document.getElementById("filter-row");
const outingFeed = document.getElementById("outing-feed");
const searchInput = document.getElementById("search-input");
const feedCount = document.getElementById("feed-count");
const detailsModal = document.getElementById("details-modal");
const detailsContent = document.getElementById("details-content");
const createModal = document.getElementById("create-modal");
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

const state = {
  activeCategory: "All",
  searchTerm: "",
  selectedEventId: null
};

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

function getVisibleOutings() {
  return outings.filter((outing) => {
    const matchesCategory =
      state.activeCategory === "All" || outing.category === state.activeCategory;
    const haystack = `${outing.title} ${outing.location} ${outing.description} ${outing.category}`.toLowerCase();
    const matchesSearch = haystack.includes(state.searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });
}

function renderFilters() {
  filterRow.innerHTML = categories
    .map(
      (category) => `
        <button
          class="filter-chip ${state.activeCategory === category ? "is-active" : ""}"
          type="button"
          data-category="${category}"
        >
          ${category}
        </button>
      `
    )
    .join("");

  filterRow.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.activeCategory = chip.dataset.category;
      renderFilters();
      renderOutings();
    });
  });
}

function renderOutings() {
  const visibleOutings = getVisibleOutings();

  feedCount.textContent = `${visibleOutings.length} outing${visibleOutings.length === 1 ? "" : "s"}`;

  if (!visibleOutings.length) {
    outingFeed.innerHTML = `
      <div class="placeholder-panel" style="grid-column: 1 / -1; max-width: 100%;">
        <p class="eyebrow">No matches</p>
        <h2>Nothing matches that search yet.</h2>
        <p>Try a different vibe, neighborhood, or category to find the next outing.</p>
      </div>
    `;
    return;
  }

  outingFeed.innerHTML = visibleOutings
    .map(
      (outing) => `
        <article class="outing-card" data-id="${outing.id}" tabindex="0" aria-label="Open details for ${outing.title}">
          <div class="card-media" style="background-image: ${outing.image};"></div>
          <div class="card-body">
            <div class="card-head">
              <span class="category-badge">${outing.category}</span>
              ${outing.curated ? '<span class="curated-badge">Curated</span>' : ""}
            </div>
            <h3>${outing.title}</h3>
            <ul class="meta-list">
              <li><span class="meta-label">When</span> ${formatDate(outing.date)}</li>
              <li><span class="meta-label">Where</span> ${outing.location}</li>
              <li><span class="meta-label">Type</span> ${outing.participationType}</li>
            </ul>
            <p class="outing-description">${outing.description}</p>
            <div class="card-footer">
              <span class="cost-pill">${outing.cost}</span>
              <button class="card-link" type="button">View details</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

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

  state.selectedEventId = id;

  detailsContent.innerHTML = `
    <div class="detail-content">
      <div class="detail-media" style="background-image: ${event.image};"></div>
      <div class="detail-header">
        <span class="category-badge">${event.category}</span>
        <span class="participation-badge">${event.participationType}</span>
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
          <span>Estimated Cost</span>
          <strong>${event.cost}</strong>
        </div>
        <div class="detail-item">
          <span>Participation</span>
          <strong>${event.participationType}</strong>
        </div>
      </div>
      <div class="detail-tags">
        ${event.tags.map((tag) => `<span class="detail-tag">${tag}</span>`).join("")}
      </div>
      <div class="detail-actions">
        <button class="primary-button" type="button" id="prototype-interest-button">Express interest</button>
        <button class="secondary-button" type="button" data-close-modal="details-modal">Close</button>
      </div>
      <p class="detail-note">Prototype interaction only: this demo does not send invitations or confirm bookings.</p>
    </div>
  `;

  const interestButton = document.getElementById("prototype-interest-button");
  if (interestButton) {
    interestButton.addEventListener("click", () => {
      interestButton.textContent = "Interest recorded";
      interestButton.disabled = true;
      interestButton.style.opacity = "0.8";
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

document.getElementById("explore-outings").addEventListener("click", () => {
  document.getElementById("outing-feed").scrollIntoView({ behavior: "smooth", block: "start" });
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

renderFilters();
renderOutings();
setActiveScreen("discover");
