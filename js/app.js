const outingFeed = document.getElementById("outing-feed");
const searchInput = document.getElementById("search-input");
const feedCount = document.getElementById("feed-count");
const detailsModal = document.getElementById("details-modal");
const detailsContent = document.getElementById("details-content");
const createModal = document.getElementById("create-modal");
const createForm = document.getElementById("create-outing-form");
const createTypeButtons = document.querySelectorAll(".create-type-option");
const createTypePanels = document.querySelectorAll("[data-type-panel]");
const createPreviewPanel = document.getElementById("create-preview-panel");
const createFormActions = document.getElementById("create-form-actions");
const createPublishActions = document.getElementById("create-publish-actions");
const createToast = document.getElementById("creation-toast");
const createImageFileInput = document.getElementById("create-image-file");
const createImageField = document.getElementById("create-image-field");
const categorySelect = document.getElementById("category-select");
const navButtons = document.querySelectorAll("[data-screen]");
const discoverViewButtons = document.querySelectorAll("[data-discover-view]");
const navDropdowns = document.querySelectorAll("[data-nav-dropdown]");
const planSectionButtons = document.querySelectorAll("[data-plan-section]");
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

const discoverViewMeta = {
  regular: "Regular",
  calendar: "Calendar",
  map: "Map"
};

const locationCoordinates = {
  "The Linq Promenade": { lat: 36.1171, lng: -115.1712, type: "cross streets" },
  "Downtown Las Vegas": { lat: 36.1699, lng: -115.1398, type: "area" },
  "Downtown Arts District": { lat: 36.1708, lng: -115.1458, type: "neighborhood" },
  "Red Rock Scenic Loop": { lat: 36.1314, lng: -115.4173, type: "area" },
  "Player 1 Video Game Bar, Downtown": { lat: 36.1691, lng: -115.1401, type: "exact address" },
  "South Strip": { lat: 36.1039, lng: -115.1775, type: "area" },
  "Arts District": { lat: 36.1678, lng: -115.1475, type: "neighborhood" },
  "Summerlin": { lat: 36.1674, lng: -115.3347, type: "area" },
  "Lake Mead Parkway": { lat: 36.0396, lng: -115.1185, type: "area" },
  "Fremont East": { lat: 36.1696, lng: -115.142, type: "neighborhood" },
  "Fremont Street": { lat: 36.1699, lng: -115.1418, type: "cross streets" },
  "The District at Green Valley": { lat: 36.0569, lng: -115.0912, type: "area" },
  "Pioneer & 7th Streets": { lat: 36.1711, lng: -115.1404, type: "cross streets" },
  "Paradise Rd & Flamingo Rd": { lat: 36.1155, lng: -115.1724, type: "cross streets" },
  "Green Valley Pkwy & Arroyo Grande Blvd": { lat: 36.0553, lng: -115.0932, type: "cross streets" },
  "Fremont St & 7th St": { lat: 36.1715, lng: -115.1427, type: "cross streets" }
};

const outingTypeMeta = {
  OPEN_OUTING: {
    label: "Open Outing",
    description: "Open to everyone. No invitation necessary."
  },
  PUBLIC_OUTING: {
    label: "Public Outing",
    description: "Express interest. Get selected. Join the experience."
  },
  PRIVATE_OUTING: {
    label: "Private Outing",
    description: "Invitation-only. Hidden from the public Discover feed."
  }
};

const STORAGE_KEY = "inabowt-demo-state-v1";

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      activeCategory: saved.activeCategory || "All",
      activeType: saved.activeType || "OPEN_OUTING",
      searchTerm: saved.searchTerm || "",
      participationStatus: saved.participationStatus || {},
      invitationStatus: saved.invitationStatus || {},
      activePlansTab: saved.activePlansTab || "UPCOMING",
      discoverView: saved.discoverView || "regular",
      calendarMonth: saved.calendarMonth ? new Date(saved.calendarMonth) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      createdOutings: Array.isArray(saved.createdOutings) ? saved.createdOutings : [],
      createdByUser: saved.createdByUser || {},
      persistedOutings: Array.isArray(saved.persistedOutings) ? saved.persistedOutings : []
    };
  } catch (error) {
    return {
      activeCategory: "All",
      activeType: "OPEN_OUTING",
      searchTerm: "",
      participationStatus: {},
      invitationStatus: {},
      activePlansTab: "UPCOMING",
      discoverView: "regular",
      calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      createdOutings: [],
      createdByUser: {},
      persistedOutings: []
    };
  }
}

const state = {
  activeCategory: "All",
  activeType: "OPEN_OUTING",
  searchTerm: "",
  participationStatus: {},
  invitationStatus: {},
  activePlansTab: "UPCOMING",
  discoverView: "regular",
  calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  calendarSelectedDate: new Date().toISOString().slice(0, 10),
  createdOutings: [],
  createdByUser: {},
  persistedOutings: [],
  ...loadSavedState()
};

if (!state.calendarSelectedDate) {
  state.calendarSelectedDate = new Date().toISOString().slice(0, 10);
}

if (Array.isArray(state.persistedOutings) && state.persistedOutings.length) {
  state.persistedOutings.forEach((persistedOuting) => {
    if (!outings.some((existing) => existing.id === persistedOuting.id)) {
      outings.push(persistedOuting);
    }
  });
}

function persistSavedState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      activeCategory: state.activeCategory,
      activeType: state.activeType,
      searchTerm: state.searchTerm,
      participationStatus: state.participationStatus,
      invitationStatus: state.invitationStatus,
      activePlansTab: state.activePlansTab,
      discoverView: state.discoverView,
      calendarMonth: state.calendarMonth.toISOString(),
      createdOutings: state.createdOutings,
      createdByUser: state.createdByUser,
      persistedOutings: outings.filter((outing) => state.createdOutings.includes(outing.id))
    })
  );
}

function parseDateTime(value) {
  if (!value) return new Date(0);
  const isoText = String(value).trim();
  const usableValue = isoText.includes("T") ? isoText : `${isoText}T12:00`;
  const parsed = new Date(usableValue);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatTime(dateValue) {
  const date = parseDateTime(dateValue);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getEventDateValue(outing) {
  return parseDateTime(outing?.date).getTime();
}

function getSortedOutings(list) {
  return [...list].sort((a, b) => getEventDateValue(a) - getEventDateValue(b));
}

function getLocationCoords(outing) {
  const direct = outing?.coordinates;
  if (direct && typeof direct.lat === "number" && typeof direct.lng === "number") {
    return { lat: direct.lat, lng: direct.lng, type: direct.type || "exact address" };
  }

  const addressString = String(outing?.address || outing?.location || "").trim();
  const exactAddress = addressString ? locationCoordinates[addressString] : null;
  if (exactAddress && typeof exactAddress.lat === "number" && typeof exactAddress.lng === "number") {
    return { lat: exactAddress.lat, lng: exactAddress.lng, type: exactAddress.type || "address" };
  }

  const namedLocation = outing?.location ? locationCoordinates[outing.location] : null;
  if (namedLocation && typeof namedLocation.lat === "number" && typeof namedLocation.lng === "number") {
    return { lat: namedLocation.lat, lng: namedLocation.lng, type: namedLocation.type || "area" };
  }

  const fallback = { lat: 36.1699, lng: -115.1398, type: "area" };
  return { lat: fallback.lat, lng: fallback.lng, type: fallback.type || "area" };
}

function normalizePublicTags(rawTags) {
  const rawText = Array.isArray(rawTags)
    ? rawTags.join(" ")
    : String(rawTags || "");

  const candidates = rawText
    .split(/[\n,;]+|\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const normalized = candidates
    .map((tag) => String(tag || "").trim().replace(/\s+/g, ""))
    .filter(Boolean)
    .filter((tag) => !/\s/.test(tag))
    .filter((tag) => /^[A-Za-z0-9-]+$/.test(tag))
    .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1));

  return [...new Set(normalized.map((tag) => tag.toLowerCase()).map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1)))];
}

function normalizeImageValue(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))";
  }

  if (value.startsWith("url(")) {
    return value;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("assets/") ||
    value.startsWith("data:")
  ) {
    return `url('${value.replace(/'/g, "\\'")}')`;
  }

  return value;
}

function normalizeOutingType(outing) {
  const rawType = outing.outingType || outing.participationType || "OPEN_OUTING";
  return String(rawType).replace(/\s+/g, "_").toUpperCase();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `outing-${Date.now()}`;
}

function getEventById(eventId) {
  return outings.find((outing) => outing.id === eventId) || null;
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

function getVisibleOutings(includePast = false) {
  const todayStart = startOfToday().getTime();
  return getSortedOutings(
    outings.filter((outing) => {
      const outingType = normalizeOutingType(outing);
      if (outingType === "PRIVATE_OUTING") {
        return false;
      }

      const matchesType = outingType === state.activeType;
      const matchesCategory =
        state.activeCategory === "All" || outing.category === state.activeCategory;
      const haystack = `${outing.title} ${outing.location} ${outing.description} ${outing.category} ${outing.creatorName}`.toLowerCase();
      const matchesSearch = haystack.includes(state.searchTerm.toLowerCase());
      const isWithinTimeWindow = includePast || getEventDateValue(outing) >= todayStart;

      return matchesType && matchesCategory && matchesSearch && isWithinTimeWindow;
    })
  );
}

function getTypeBadgeClasses(type) {
  if (type === "OPEN_OUTING") return "type-badge open";
  if (type === "PRIVATE_OUTING") return "type-badge private";
  return "type-badge public";
}

function getPublicTags(outing) {
  const tags = normalizePublicTags(outing?.tags || []);
  return tags.slice(0, 3).length ? tags.slice(0, 3) : ["Social", "Explore", "Local"];
}

function renderTypeToggle() {
  document.querySelectorAll(".outing-type-option").forEach((button) => {
    const isActive = button.dataset.outingType === state.activeType;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function renderDiscoverView() {
  const panels = document.querySelectorAll(".discover-view-panel");
  panels.forEach((panel) => {
    const isVisible = panel.id === `discover-${state.discoverView === "regular" ? "regular" : state.discoverView === "calendar" ? "calendar" : "map"}-view`;
    panel.classList.toggle("hidden", !isVisible);
    panel.classList.toggle("is-visible", isVisible);
  });

  discoverViewButtons.forEach((button) => {
    const isActive = button.dataset.discoverView === state.discoverView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (state.discoverView === "calendar") {
    renderCalendarView();
  }

  if (state.discoverView === "map") {
    renderMapView();
  }
}

function syncPlanSelection() {
  document.querySelectorAll(".plan-tab").forEach((button) => {
    const isActive = button.dataset.planTab === state.activePlansTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".nav-dropdown-item").forEach((button) => {
    const isSelected = button.dataset.planSection === state.activePlansTab;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-current", isSelected ? "page" : "false");
  });
}

function closeNavDropdowns() {
  navDropdowns.forEach((dropdown) => {
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    const trigger = dropdown.querySelector(".nav-dropdown-trigger");
    if (menu) menu.classList.add("hidden");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
}

function toggleNavDropdown(dropdown) {
  const menu = dropdown.querySelector(".nav-dropdown-menu");
  const trigger = dropdown.querySelector(".nav-dropdown-trigger");
  if (!menu || !trigger) return;

  const shouldOpen = menu.classList.contains("hidden");
  closeNavDropdowns();

  if (shouldOpen) {
    menu.classList.remove("hidden");
    trigger.setAttribute("aria-expanded", "true");
  }
}

function renderDiscoverContent() {
  renderDiscoverView();

  if (state.discoverView === "regular") {
    renderOutings();
    return;
  }

  if (state.discoverView === "calendar") {
    renderCalendarView();
    return;
  }

  renderMapView();
}

function renderNewsFeed() {
  const feed = document.getElementById("news-feed");
  if (!feed) return;

  const entries = window.demoNewsFeed || [];
  if (!entries.length) {
    feed.innerHTML = `
      <div class="placeholder-panel no-results">
        <p class="eyebrow">News Feed</p>
        <h2>Community updates are on the way.</h2>
        <p>Check back soon for community storyboards and demo activity updates.</p>
      </div>
    `;
    return;
  }

  feed.innerHTML = `
    <div class="news-feed-header">
      <p class="eyebrow">News Feed</p>
      <h2>What the community is up to</h2>
    </div>
    <div class="news-feed-grid">
      ${entries
        .map(
          (entry) => `
            <article class="news-card ${entry.kind === "story" ? "story" : "activity"}">
              <div class="news-card-top">
                <span class="news-card-tag">${entry.label}</span>
              </div>
              <h3>${entry.title}</h3>
              <p>${entry.description}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCalendarView() {
  const calendarGrid = document.getElementById("calendar-grid");
  const monthLabel = document.getElementById("calendar-month-label");
  if (!calendarGrid || !monthLabel) return;

  const monthDate = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth(), 1);
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(monthDate);
  monthLabel.textContent = monthName;

  const visibleEvents = getVisibleOutings(true);
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - startOffset);

  const cells = [];
  const selectedDate = state.calendarSelectedDate || new Date().toISOString().slice(0, 10);

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const isoDate = date.toISOString().slice(0, 10);
    const eventsForDate = visibleEvents.filter((outing) => {
      const outingDate = new Date(parseDateTime(outing.date));
      return outingDate.toISOString().slice(0, 10) === isoDate;
    });
    const dayClass = [
      "calendar-day",
      date.getMonth() !== monthDate.getMonth() ? "is-muted" : "",
      eventsForDate.length ? "has-events" : "",
      isoDate === selectedDate ? "is-selected" : ""
    ].filter(Boolean).join(" ");

    cells.push(`
      <button type="button" class="${dayClass}" data-calendar-date="${isoDate}" ${eventsForDate.length ? "aria-label=\"${eventsForDate.length} events on ${isoDate}\"" : ""}>
        <span class="calendar-day-number">${date.getDate()}</span>
        ${eventsForDate.length ? `<span class="calendar-day-badge">${Math.min(eventsForDate.length, 3)}</span>` : ""}
        ${eventsForDate.slice(0, 2).map((event) => `<span class="calendar-day-label">${event.title}</span>`).join("")}
      </button>
    `);
  }

  calendarGrid.innerHTML = cells.join("");

  calendarGrid.querySelectorAll(".calendar-day").forEach((button) => {
    button.addEventListener("click", () => {
      state.calendarSelectedDate = button.dataset.calendarDate;
      renderCalendarView();
      const dayEvents = visibleEvents.filter((outing) => new Date(parseDateTime(outing.date)).toISOString().slice(0, 10) === state.calendarSelectedDate);
      if (!dayEvents.length) {
        return;
      }
      const event = dayEvents[0];
      openEventDetails(event.id);
    });
  });
}

function renderMapView() {
  const mapContainer = document.getElementById("discover-map");
  if (!mapContainer) return;

  if (!window.L) {
    mapContainer.innerHTML = '<div class="placeholder-panel no-results"><p class="eyebrow">Map unavailable</p><h2>Map tiles could not load.</h2><p>The app will continue to work in Regular and Calendar views.</p></div>';
    return;
  }

  const visibleEvents = getVisibleOutings();
  if (!visibleEvents.length) {
    mapContainer.innerHTML = '<div class="placeholder-panel no-results"><p class="eyebrow">No map results</p><h2>No current outings match this filter.</h2><p>Try a different category or reset your search.</p></div>';
    return;
  }

  const lasVegasBounds = [
    [35.9, -115.6],
    [36.5, -114.8]
  ];

  if (!mapContainer._inabowtMap) {
    const map = window.L.map("discover-map", {
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 9,
      maxZoom: 13,
      maxBounds: lasVegasBounds,
      maxBoundsViscosity: 1.0,
      attributionControl: false
    }).setView([36.1699, -115.1398], 10.5);

    window.L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; Stadia Maps',
      maxZoom: 20,
      noWrap: true,
      subdomains: "abcd"
    }).addTo(map);

    mapContainer._inabowtMap = map;
  }

  const map = mapContainer._inabowtMap;
  map.setMaxBounds(lasVegasBounds);
  map.setView([36.1699, -115.1398], 10.5);
  map.eachLayer((layer) => {
    if (layer instanceof window.L.Marker) {
      map.removeLayer(layer);
    }
  });

  const validCoords = visibleEvents
    .map((outing) => {
      const point = getLocationCoords(outing);
      return { outing, point };
    })
    .filter(({ point }) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

  if (!validCoords.length) {
    mapContainer.innerHTML = '<div class="placeholder-panel no-results"><p class="eyebrow">Map unavailable</p><h2>These outings do not have a usable map location.</h2><p>Regular and Calendar views still show them normally.</p></div>';
    return;
  }

  const bounds = [];
  validCoords.forEach(({ outing, point }) => {
    const marker = window.L.marker([point.lat, point.lng], {
      title: outing.title
    }).addTo(map);

    const participantCount = outing.capacity ? `${outing.capacity} spots` : "Flexible";
    const popupHtml = `
      <div class="map-popup-card">
        <div class="map-popup-badge">${outing.category}</div>
        <h3>${outing.title}</h3>
        <p class="map-popup-location">${outing.location}</p>
        <div class="map-popup-stats">
          <span>${formatDate(outing.date)}</span>
          <span>${formatTime(outing.date)}</span>
          <span>${participantCount}</span>
        </div>
        <button type="button" class="map-popup-button" data-map-id="${outing.id}">View details</button>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.on("popupopen", (event) => {
      const popupButton = event.popup.getElement()?.querySelector(".map-popup-button");
      if (!popupButton) return;

      popupButton.addEventListener("click", () => {
        openEventDetails(popupButton.dataset.mapId);
      });
    });

    bounds.push([point.lat, point.lng]);
  });

  map.fitBounds(lasVegasBounds, { padding: [24, 24] });
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
      const tagMarkup = getPublicTags(outing)
        .slice(0, 3)
        .map((tag) => `<span class="detail-tag">${tag}</span>`)
        .join("");
      const badgeRow = `
        <div class="badge-row">
          <span class="category-badge">${outing.category}</span>
          <span class="${getTypeBadgeClasses(outingType)}">${outingTypeMeta[outingType].label}</span>
          ${outing.curated && outingType === "OPEN_OUTING" ? '<span class="curated-badge">Curated By Inabowt</span>' : ""}
        </div>
      `;

      const metaRows = [
        `<li><span class="meta-label">When</span> ${formatDate(outing.date)}</li>`,
        `<li><span class="meta-label">Start</span> ${formatTime(outing.date)}</li>`,
        `<li><span class="meta-label">Where</span> ${outing.location}</li>`
      ];

      if (outingType === "PUBLIC_OUTING") {
        metaRows.push(`<li><span class="meta-label">Capacity</span> ${outing.capacity || "Flexible"}</li>`);
      }

      return `
        <article class="outing-card" data-id="${outing.id}" tabindex="0" aria-label="Open details for ${outing.title}">
          <div class="card-media" data-image="${outing.image}" data-fallback="${mediaFallback}" style="background-image: ${outing.image};"></div>
          <div class="card-body">
            ${badgeRow}
            <h3>${outing.title}</h3>
            <ul class="meta-list">
              ${metaRows.join("")}
            </ul>
            <p class="outing-description">${outing.description}</p>
            <div class="detail-tags">${tagMarkup}</div>
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
    const viewDetailsButton = card.querySelector(".card-link");
    if (viewDetailsButton) {
      viewDetailsButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openEventDetails(card.dataset.id);
      });
    }
  });
}

function renderPlansScreen() {
  const plansContent = document.getElementById("plans-content");
  syncPlanSelection();

  const activeCreatedItems = outings.filter((outing) => state.createdOutings.includes(outing.id));
  const upcomingItems = [
    ...outings.filter((outing) => state.participationStatus[outing.id] === "JOINED"),
    ...activeCreatedItems
  ].filter((outing, index, arr) => arr.findIndex((candidate) => candidate.id === outing.id) === index);
  const pendingItems = outings.filter((outing) => state.participationStatus[outing.id] === "INTERESTED");
  const pastItems = demoPastOutings;

  let items = [];
  if (state.activePlansTab === "UPCOMING") {
    items = getSortedOutings(upcomingItems);
  } else if (state.activePlansTab === "PENDING") {
    items = getSortedOutings(pendingItems);
  } else if (state.activePlansTab === "INVITATIONS") {
    items = getSortedOutings(
      demoInvitations.filter((invite) => {
        const inviteStatus = state.invitationStatus[invite.eventId];
        return inviteStatus !== "ACCEPTED" && inviteStatus !== "DECLINED";
      })
    );
  } else if (state.activePlansTab === "PAST") {
    items = getSortedOutings(pastItems);
  }

  if (!items.length) {
    const noResultsMap = {
      UPCOMING: {
        headline: "No outings on your calendar yet.",
        description: "Find something worth getting out for."
      },
      PENDING: {
        headline: "Your next adventure could be waiting for an invitation.",
        description: "Public outings you express interest in will show up here."
      },
      INVITATIONS: {
        headline: "You’re all caught up.",
        description: "New invitations will appear here when they arrive."
      },
      PAST: {
        headline: "Your experiences will appear here after you attend an outing.",
        description: "This is a sample history view for the prototype."
      }
    };
    const content = noResultsMap[state.activePlansTab] || noResultsMap.UPCOMING;
    plansContent.innerHTML = `
      <div class="empty-plan-state">
        <p class="eyebrow">${state.activePlansTab}</p>
        <h3>${content.headline}</h3>
        <p>${content.description}</p>
      </div>
    `;
    return;
  }

  plansContent.innerHTML = items
    .map((item) => {
      const event = getEventById(item.eventId || item.id) || item;
      const outingType = normalizeOutingType(event);
      const title = event.title || item.title;
      const category = event.category || item.category;
      const date = event.date || item.date;
      const location = event.location || item.location;
      const image = event.image || item.image;
      const description = event.description || item.description;
      const creatorName = event.creatorName || item.creatorName || "Inabowt Community";
      const finalTypeText = outingTypeMeta[outingType]?.label || "Open Outing";
      const isCreatedByUser = state.createdOutings.includes(event.id);
      const statusText = state.activePlansTab === "UPCOMING"
        ? isCreatedByUser ? "Created by You" : "Joined"
        : state.activePlansTab === "PENDING"
          ? "Interest Submitted"
          : state.activePlansTab === "PAST"
            ? "Completed"
            : "Invitation Pending";

      const invitationActions = state.activePlansTab === "INVITATIONS"
        ? `
          <div class="plan-actions">
            <button class="primary-button compact" type="button" data-invite-action="accept" data-invite-id="${item.id}">Accept</button>
            <button class="secondary-button compact" type="button" data-invite-action="decline" data-invite-id="${item.id}">Decline</button>
          </div>
        `
        : "";

      return `
        <article class="plans-card" data-plan-item-id="${item.id || event.id}">
          <div class="plans-card-media" data-image="${image}" data-fallback="linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))" style="background-image: ${image};"></div>
          <div class="plans-card-body">
            <div class="badge-row">
              <span class="category-badge">${category}</span>
              <span class="${getTypeBadgeClasses(outingType)}">${finalTypeText}</span>
            </div>
            <h3>${title}</h3>
            <ul class="meta-list">
              <li><span class="meta-label">When</span> ${formatDate(date)}</li>
              <li><span class="meta-label">Where</span> ${location}</li>
              <li><span class="meta-label">Creator</span> ${creatorName}</li>
            </ul>
            <p class="outing-description">${description}</p>
            <div class="plan-status-row">
              <span class="plan-status-badge">${statusText}</span>
            </div>
            ${invitationActions}
          </div>
        </article>
      `;
    })
    .join("");

  plansContent.querySelectorAll(".plans-card-media").forEach((cardMedia) => {
    setMediaBackground(cardMedia, cardMedia.dataset.image, cardMedia.dataset.fallback);
  });

  const inviteActions = plansContent.querySelectorAll("[data-invite-action]");
  inviteActions.forEach((button) => {
    button.addEventListener("click", () => {
      const inviteId = button.dataset.inviteId;
      const invite = demoInvitations.find((item) => item.id === inviteId);
      if (!invite) return;

      if (button.dataset.inviteAction === "accept") {
        state.invitationStatus[invite.eventId] = "ACCEPTED";
        state.participationStatus[invite.eventId] = "JOINED";
      }

      if (button.dataset.inviteAction === "decline") {
        state.invitationStatus[invite.eventId] = "DECLINED";
      }

      persistSavedState();
      renderPlansScreen();
    });
  });
}

function openEventDetails(id) {
  const event = getEventById(id);
  if (!event) return;

  const outingType = normalizeOutingType(event);
  const createdByUser = state.createdOutings.includes(event.id);
  const activeStatus = state.participationStatus[id];
  const isJoined = outingType === "OPEN_OUTING" && activeStatus === "JOINED";
  const isInterested = outingType === "PUBLIC_OUTING" && activeStatus === "INTERESTED";
  const actionText = createdByUser
    ? "Created by you"
    : outingType === "OPEN_OUTING"
      ? isJoined ? "Joined" : "Join outing"
      : isInterested ? "Interest recorded" : "Express interest";
  const mediaFallback = "linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))";
  const publicTags = getPublicTags(event);

  const publicDetailMarkup = `
    <div class="detail-content">
      <div class="detail-media" data-image="${event.image}" data-fallback="${mediaFallback}" style="background-image: ${event.image};"></div>
      <div class="detail-header">
        <span class="category-badge">${event.category}</span>
        <span class="${getTypeBadgeClasses(outingType)}">${outingTypeMeta[outingType].label}</span>
      </div>
      <h2 id="details-title" class="detail-title">${event.title}</h2>
      <p class="detail-description">${event.description}</p>
      <div class="detail-grid">
        <div class="detail-item"><span>Date</span><strong>${formatDate(event.date)}</strong></div>
        <div class="detail-item"><span>Start time</span><strong>${formatTime(event.date)}</strong></div>
        <div class="detail-item"><span>Location</span><strong>${event.location}</strong></div>
        <div class="detail-item"><span>Capacity</span><strong>${event.capacity || "Flexible"}</strong></div>
      </div>
      <div class="detail-tags">
        ${publicTags.map((tag) => `<span class="detail-tag">${tag}</span>`).join("")}
      </div>
      <div class="detail-actions">
        <button class="primary-button" type="button" id="prototype-interaction-button" data-event-id="${event.id}" ${createdByUser || isJoined || isInterested ? "disabled" : ""}>${actionText}</button>
        <button class="secondary-button" type="button" data-close-modal="details-modal">Close</button>
      </div>
      <p class="detail-note">Prototype interaction only: expressing interest does not guarantee selection or attendance.</p>
    </div>
  `;

  const standardDetailMarkup = `
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
        ${(event.tags || []).map((tag) => `<span class="detail-tag">${tag}</span>`).join("")}
      </div>
      <div class="detail-actions">
        <button class="primary-button" type="button" id="prototype-interaction-button" data-event-id="${event.id}" ${createdByUser || isJoined || isInterested ? "disabled" : ""}>${actionText}</button>
        <button class="secondary-button" type="button" data-close-modal="details-modal">Close</button>
      </div>
      <p class="detail-note">
        ${outingType === "PUBLIC_OUTING"
          ? "Prototype interaction only: expressing interest does not guarantee selection or attendance."
          : outingType === "PRIVATE_OUTING"
            ? "Prototype interaction only: private outing details are hidden from unrelated users in this demo."
            : "Prototype interaction only: joining this outing updates your participation status in the demo."}
      </p>
    </div>
  `;

  detailsContent.innerHTML = outingType === "PUBLIC_OUTING" ? publicDetailMarkup : standardDetailMarkup;

  const detailMedia = detailsContent.querySelector(".detail-media");
  if (detailMedia) {
    setMediaBackground(detailMedia, detailMedia.dataset.image, detailMedia.dataset.fallback);
  }

  const interactionButton = document.getElementById("prototype-interaction-button");
  if (interactionButton) {
    interactionButton.addEventListener("click", () => {
      const nextStatus = outingType === "OPEN_OUTING" ? "JOINED" : "INTERESTED";
      if (state.participationStatus[event.id] === nextStatus) {
        return;
      }

      if (outingType === "PUBLIC_OUTING") {
        if (state.participationStatus[event.id] === "JOINED") {
          return;
        }
        state.participationStatus[event.id] = "INTERESTED";
      } else {
        state.participationStatus[event.id] = "JOINED";
        state.invitationStatus[event.id] = "ACCEPTED";
      }

      persistSavedState();
      renderPlansScreen();
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

function clearCreateErrors() {
  document.querySelectorAll(".error-message").forEach((message) => {
    message.textContent = "";
  });
}

function setCreateType(type) {
  createTypeButtons.forEach((button) => {
    const isSelected = button.dataset.createType === type;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  createTypePanels.forEach((panel) => {
    const isVisible = panel.dataset.typePanel === type;
    panel.classList.toggle("is-visible", isVisible);
  });
}

function resetCreateForm() {
  clearCreateErrors();
  createForm.reset();
  if (createImageFileInput) createImageFileInput.value = "";
  if (createImageField) createImageField.value = "";
  setCreateType("OPEN_OUTING");
  createPreviewPanel.classList.add("hidden");
  createPreviewPanel.innerHTML = "";
  createFormActions.classList.remove("hidden");
  createPublishActions.classList.add("hidden");
}

async function handleCreateImageSelection(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    if (createImageField) createImageField.value = "";
    return;
  }

  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image file."));
      reader.readAsDataURL(file);
    });

    if (createImageField) {
      createImageField.value = dataUrl;
    }
  } catch (error) {
    if (createImageField) createImageField.value = "";
    showToast("We couldn't load that image. Please try another one.");
  }
}

function showToast(message) {
  createToast.textContent = message;
  createToast.classList.remove("hidden");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    createToast.classList.add("hidden");
  }, 2400);
}

function validateCreateForm() {
  const data = {
    outingType: "OPEN_OUTING",
    title: document.getElementById("create-title-field").value.trim(),
    category: document.getElementById("create-category-field").value,
    description: document.getElementById("create-description-field").value.trim(),
    date: document.getElementById("create-date-field").value,
    time: document.getElementById("create-time-field").value,
    location: document.getElementById("create-location-field").value.trim(),
    cost: document.getElementById("create-cost-field").value.trim(),
    capacity: document.getElementById("create-capacity-field").value,
    image: document.getElementById("create-image-field").value.trim(),
    openRequirements: document.getElementById("create-open-requirements").value.trim(),
    publicNotes: document.getElementById("create-public-notes").value.trim(),
    publicTags: normalizePublicTags(document.getElementById("create-public-tags")?.value || ""),
    privateTags: normalizePublicTags(document.getElementById("create-private-tags")?.value || "")
  };

  const selectedTypeButton = document.querySelector(".create-type-option.is-selected");
  data.outingType = selectedTypeButton ? selectedTypeButton.dataset.createType : "OPEN_OUTING";

  if (data.outingType === "PRIVATE_OUTING") {
    data.publicTags = [...data.privateTags];
  }

  const errors = {};
  const requiredFields = [
    ["title", data.title, "Please add an outing title."],
    ["category", data.category, "Please choose a category."],
    ["description", data.description, "Please add a short description."],
    ["date", data.date, "Please choose a date."],
    ["time", data.time, "Please choose a start time."],
    ["location", data.location, "Please add a specific address or cross streets."],
    ["cost", data.cost, "Please add an estimated cost."],
    ["capacity", data.capacity, "Please add participant capacity."]
  ];

  requiredFields.forEach(([field, value, message]) => {
    if (!value || (field === "capacity" && Number(value) < 2)) {
      errors[field] = message;
    }
  });

  if (data.capacity && Number(data.capacity) > 200) {
    errors.capacity = "Capacity should be 200 or fewer.";
  }

  if (data.image && !/^(https?:\/\/|\/|assets\/|data:)/i.test(data.image)) {
    errors.image = "Use a valid image path or upload a file.";
  }

  if (data.outingType === "PUBLIC_OUTING" || data.outingType === "PRIVATE_OUTING") {
    const tagFieldName = data.outingType === "PUBLIC_OUTING" ? "publicTags" : "privateTags";
    const tagErrorField = data.outingType === "PUBLIC_OUTING" ? "publicTags" : "privateTags";

    if (data[tagFieldName].length !== 3) {
      errors[tagErrorField] = "Please add exactly three one-word tags.";
    } else if (new Set(data[tagFieldName].map((tag) => tag.toLowerCase())).size !== 3) {
      errors[tagErrorField] = "Tags must be unique and one word each.";
    }
  }

  document.querySelectorAll(".error-message").forEach((node) => {
    const field = node.dataset.errorFor;
    node.textContent = errors[field] || "";
  });

  return { valid: Object.keys(errors).length === 0, values: data, errors };
}

function buildCreatePreview(values) {
  const type = values.outingType;
  const eventDate = values.date ? new Date(`${values.date}T${values.time || "18:00"}:00`) : null;
  const formattedDate = eventDate ? formatDate(eventDate.toISOString()) : "Pick a date";

  const imageValue = normalizeImageValue(values.image);
  const typeLabel = outingTypeMeta[type]?.label || "Open Outing";
  const tags = values.outingType === "PUBLIC_OUTING" ? values.publicTags : [values.category, values.location, values.outingType === "PRIVATE_OUTING" ? "Invite-only" : "Social"];

  return `
    <p class="preview-heading">Preview</p>
    <article class="outing-card create-preview-card" aria-label="Preview for ${values.title || "new outing"}">
      <div class="card-media" data-image="${imageValue}" data-fallback="linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))" style="background-image: ${imageValue};"></div>
      <div class="card-body">
        <div class="badge-row">
          <span class="category-badge">${values.category || "Category"}</span>
          <span class="${getTypeBadgeClasses(type)}">${typeLabel}</span>
        </div>
        <h3>${values.title || "New outing"}</h3>
        <ul class="meta-list">
          <li><span class="meta-label">When</span> ${formattedDate}</li>
          <li><span class="meta-label">Start</span> ${values.time || "Flexible"}</li>
          <li><span class="meta-label">Where</span> ${values.location || "Specific address or cross streets"}</li>
          <li><span class="meta-label">Capacity</span> ${values.capacity || "Flexible"}</li>
        </ul>
        <p class="outing-description">${values.description || "Describe the experience."}</p>
        <div class="detail-tags">
          ${tags.map((tag) => `<span class="detail-tag">${tag}</span>`).join("")}
        </div>
        <div class="card-footer">
          <span class="status-pill">${typeLabel}</span>
          <button class="card-link" type="button">Preview only</button>
        </div>
      </div>
    </article>
  `;
}

function showCreatePreview() {
  const validation = validateCreateForm();
  if (!validation.valid) {
    return;
  }

  createPreviewPanel.innerHTML = buildCreatePreview(validation.values);
  createPreviewPanel.classList.remove("hidden");
  createFormActions.classList.add("hidden");
  createPublishActions.classList.remove("hidden");

  const previewMedia = createPreviewPanel.querySelector(".card-media");
  if (previewMedia) {
    setMediaBackground(previewMedia, previewMedia.dataset.image, previewMedia.dataset.fallback);
  }
}

function publishCreatedOuting() {
  const validation = validateCreateForm();
  if (!validation.valid) {
    return;
  }

  const values = validation.values;
  const type = values.outingType;
  const title = values.title.trim();
  const candidateId = `${slugify(title)}-${Date.now().toString().slice(-5)}`;
  const eventId = getEventById(candidateId) ? `${candidateId}-${Math.random().toString(36).slice(2, 6)}` : candidateId;
  const eventDate = `${values.date}T${values.time || "18:00"}:00`;
  const createdEvent = {
    id: eventId,
    title,
    category: values.category,
    date: eventDate,
    location: values.location.trim(),
    address: values.location.trim(),
    budget: values.cost.trim(),
    outingType: type,
    participationType: type,
    description: values.description.trim(),
    image: normalizeImageValue(values.image),
    tags: type === "PUBLIC_OUTING" ? normalizePublicTags(values.publicTags) : [
      values.category,
      type === "PRIVATE_OUTING" ? "Invite-only" : "Social",
      values.location.trim().split(" ")[0] || "Local"
    ],
    curated: false,
    creatorName: "You",
    attendance: "0 interested",
    capacity: Number(values.capacity || 12),
    locationType: "custom",
    coordinates: getLocationCoords({ location: values.location.trim(), address: values.location.trim() }),
    createdByUser: true,
    selectedProfiles: type === "PRIVATE_OUTING"
      ? Array.from(document.querySelectorAll(".private-profile-checkbox:checked")).map((checkbox) => checkbox.value)
      : []
  };

  outings.push(createdEvent);
  state.createdOutings.push(createdEvent.id);
  state.createdByUser[createdEvent.id] = true;
  state.persistedOutings = outings.filter((outing) => state.createdOutings.includes(outing.id));
  state.activeType = type === "PRIVATE_OUTING" ? "OPEN_OUTING" : type;

  persistSavedState();
  resetCreateForm();
  closeCreateModal();
  renderTypeToggle();
  renderOutings();
  renderPlansScreen();
  setActiveScreen("discover");
  showToast(`${outingTypeMeta[type].label} published`);
}

function closeCreateModal() {
  createModal.classList.add("hidden");
  createModal.setAttribute("aria-hidden", "true");
  resetCreateForm();
}

function setActiveScreen(screenName) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle("is-active", key === screenName);
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.screen === screenName;
    button.classList.toggle("is-active", isActive);
  });

  document.querySelectorAll(".mobile-nav-button").forEach((button) => {
    const isActive = button.dataset.screen === screenName;
    button.classList.toggle("is-active", isActive);
  });

  if (screenName === "plans") {
    renderPlansScreen();
    syncPlanSelection();
  }
}

function handleOpenCreatePlaceholder() {
  resetCreateForm();
  createModal.classList.remove("hidden");
  createModal.setAttribute("aria-hidden", "false");
}

if (createImageFileInput) {
  createImageFileInput.addEventListener("change", handleCreateImageSelection);
}

searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value.trim();
  persistSavedState();
  renderDiscoverContent();
});

categorySelect.addEventListener("change", (event) => {
  state.activeCategory = event.target.value;
  persistSavedState();
  renderDiscoverContent();
});

document.querySelectorAll(".outing-type-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeType = button.dataset.outingType;
    persistSavedState();
    renderTypeToggle();
    renderDiscoverContent();
  });
});

document.querySelectorAll(".discover-view-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.discoverView = button.dataset.discoverView;
    persistSavedState();
    renderDiscoverView();
  });
});

document.querySelectorAll(".plan-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.activePlansTab = button.dataset.planTab;
    persistSavedState();
    syncPlanSelection();
    renderPlansScreen();
  });
});

planSectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activePlansTab = button.dataset.planSection;
    persistSavedState();
    syncPlanSelection();
    renderPlansScreen();
    closeNavDropdowns();
    setActiveScreen("plans");
  });
});

document.getElementById("calendar-prev-button").addEventListener("click", () => {
  state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
  if (!state.calendarSelectedDate) {
    state.calendarSelectedDate = new Date().toISOString().slice(0, 10);
  }
  renderDiscoverView();
  persistSavedState();
});

document.getElementById("calendar-next-button").addEventListener("click", () => {
  state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
  if (!state.calendarSelectedDate) {
    state.calendarSelectedDate = new Date().toISOString().slice(0, 10);
  }
  renderDiscoverView();
  persistSavedState();
});

document.getElementById("open-create-placeholder").addEventListener("click", handleOpenCreatePlaceholder);

document.querySelectorAll(".create-type-option").forEach((button) => {
  button.addEventListener("click", () => {
    setCreateType(button.dataset.createType);
  });
});

document.getElementById("create-preview-button").addEventListener("click", showCreatePreview);
document.getElementById("create-back-button").addEventListener("click", () => {
  createPreviewPanel.classList.add("hidden");
  createFormActions.classList.remove("hidden");
  createPublishActions.classList.add("hidden");
});
document.getElementById("create-publish-button").addEventListener("click", publishCreatedOuting);

document.addEventListener("click", (event) => {
  const navDropdownTrigger = event.target.closest(".nav-dropdown-trigger");
  if (navDropdownTrigger) {
    const dropdown = navDropdownTrigger.closest("[data-nav-dropdown]");
    if (dropdown) {
      const isAlreadyOpen = !dropdown.querySelector(".nav-dropdown-menu")?.classList.contains("hidden");
      if (isAlreadyOpen) {
        closeNavDropdowns();
        return;
      }
      toggleNavDropdown(dropdown);
      setActiveScreen("plans");
    }
    return;
  }

  const planSectionTrigger = event.target.closest("[data-plan-section]");
  if (planSectionTrigger) {
    const nextTab = planSectionTrigger.dataset.planSection;
    state.activePlansTab = nextTab;
    persistSavedState();
    syncPlanSelection();
    renderPlansScreen();
    closeNavDropdowns();
    setActiveScreen("plans");
    return;
  }

  const createTypeTrigger = event.target.closest("[data-create-type]");
  if (createTypeTrigger) {
    setCreateType(createTypeTrigger.dataset.createType);
    return;
  }

  const screenTrigger = event.target.closest("[data-screen]");
  if (screenTrigger) {
    setActiveScreen(screenTrigger.dataset.screen);
    return;
  }

  if (!event.target.closest("[data-nav-dropdown]")) {
    closeNavDropdowns();
  }

  const closeTrigger = event.target.closest("[data-close-modal]");
  if (!closeTrigger) return;

  const modalId = closeTrigger.dataset.closeModal;
  if (modalId === "details-modal") closeDetailsModal();
  if (modalId === "create-modal") closeCreateModal();
});

if (searchInput) searchInput.value = state.searchTerm;
if (categorySelect) categorySelect.value = state.activeCategory;

renderTypeToggle();
renderDiscoverView();
resetCreateForm();
renderDiscoverContent();
renderPlansScreen();
setActiveScreen("discover");
