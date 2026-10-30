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

const profileInterestOptions = [
  "Food & Drinks",
  "Outdoors",
  "Games",
  "Entertainment",
  "Arts & Culture",
  "Nightlife",
  "Fitness",
  "Unique Experiences"
];

const profileAvailabilityOptions = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultUserProfile = {
  displayName: "",
  bio: "",
  photo: "",
  neighborhood: "",
  interests: [],
  availability: [],
  activityRadius: "10"
};

function getDefaultUserProfile() {
  return {
    ...defaultUserProfile,
    interests: [...defaultUserProfile.interests],
    availability: [...defaultUserProfile.availability]
  };
}

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
    const profile = saved.userProfile || {};
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
      persistedOutings: Array.isArray(saved.persistedOutings) ? saved.persistedOutings : [],
      notifications: Array.isArray(saved.notifications) ? saved.notifications : [],
      userProfile: {
        ...getDefaultUserProfile(),
        ...profile,
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        availability: Array.isArray(profile.availability) ? profile.availability : [],
        activityRadius: profile.activityRadius || "10"
      }
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
      persistedOutings: [],
      notifications: [],
      userProfile: getDefaultUserProfile()
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
  notifications: [],
  userProfile: getDefaultUserProfile(),
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
      persistedOutings: outings.filter((outing) => state.createdOutings.includes(outing.id)),
      notifications: Array.isArray(state.notifications) ? state.notifications : [],
      userProfile: state.userProfile || getDefaultUserProfile()
    })
  );
}

function buildNotificationSignature(item) {
  return [item.type, item.outingId || "", item.invitationId || "", item.title || "", item.description || ""].join("::");
}

function getNotificationSeedData() {
  const seed = Array.isArray(window.demoNotificationSeed) ? window.demoNotificationSeed : [];
  return seed.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    timestamp: item.timestamp,
    unread: Boolean(item.unread),
    dismissed: Boolean(item.dismissed),
    avatar: item.avatar || "N",
    source: item.source || "seed",
    from: item.from || "Inabowt",
    conversation: Array.isArray(item.conversation) ? item.conversation : [],
    destination: item.destination || null,
    outingId: item.outingId || null,
    invitationId: item.invitationId || null
  }));
}

function normalizeNotificationEntry(item) {
  return {
    id: item.id || `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: item.type || "activity",
    title: item.title || "Inabowt update",
    description: item.description || "You have a new update.",
    timestamp: item.timestamp || new Date().toISOString(),
    unread: Boolean(item.unread),
    dismissed: Boolean(item.dismissed),
    avatar: item.avatar || "I",
    source: item.source || "generated",
    from: item.from || "Inabowt",
    conversation: Array.isArray(item.conversation) ? item.conversation : [],
    destination: item.destination || null,
    outingId: item.outingId || null,
    invitationId: item.invitationId || null
  };
}

function notifyExists(entry) {
  const signature = buildNotificationSignature(entry);
  return state.notifications.some((item) => buildNotificationSignature(item) === signature);
}

function addNotification(entry) {
  const normalized = normalizeNotificationEntry(entry);
  if (notifyExists(normalized)) {
    return;
  }

  state.notifications = [normalized, ...state.notifications];
  persistSavedState();
  renderNotifications();
}

function getDayLabel(dateValue) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(parseDateTime(dateValue)).slice(0, 3);
}

function buildRecommendationNotifications() {
  if (!state.userProfile) {
    return [];
  }

  const interests = (state.userProfile.interests || []).map((interest) => interest.toLowerCase());
  const availability = new Set((state.userProfile.availability || []).map((day) => day.toLowerCase()));
  const neighborhood = String(state.userProfile.neighborhood || "").trim().toLowerCase();
  const radius = Number(state.userProfile.activityRadius || 10);
  const now = new Date();

  return outings
    .filter((outing) => {
      if (outing.outingType === "PRIVATE_OUTING") return false;
      if (parseDateTime(outing.date) <= now) return false;
      return true;
    })
    .map((outing) => {
      let score = 0;
      const tags = (outing.tags || []).map((tag) => String(tag).toLowerCase());
      const locationText = String(outing.location || "").toLowerCase();
      const categoryText = String(outing.category || "").toLowerCase();

      if (interests.includes(categoryText)) score += 3;
      if ((outing.tags || []).some((tag) => interests.some((interest) => tag.toLowerCase().includes(interest)))) score += 2;
      if (neighborhood && locationText.includes(neighborhood)) score += 2;
      if (availability.has(getDayLabel(outing.date).toLowerCase())) score += 1;
      if (radius >= 15) score += 1;
      if (Number(outing.capacity || 0) > 0) score += 1;

      return { outing, score, tags };
    })
    .filter(({ outing, score }) => {
      const alreadyGenerated = state.notifications.some((item) => item.type === "recommendation" && item.outingId === outing.id && !item.dismissed);
      return !alreadyGenerated && score > 0;
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ outing }) => ({
      id: `recommendation-${outing.id}`,
      type: "recommendation",
      title: `Recommended nearby: ${outing.title}`,
      description: `This ${outing.category.toLowerCase()} outing matches your ${state.userProfile.interests?.length ? "saved interests" : "activity style"} and fits your current availability.`,
      timestamp: new Date().toISOString(),
      unread: true,
      dismissed: false,
      avatar: "✦",
      source: "recommendation",
      from: "Inabowt",
      outingId: outing.id,
      destination: { screen: "discover", outingId: outing.id }
    }));
}

function syncRecommendationNotifications() {
  const recommendationBatch = buildRecommendationNotifications();
  recommendationBatch.forEach((item) => {
    if (!notifyExists(item)) {
      state.notifications.unshift(normalizeNotificationEntry(item));
    }
  });
}

function seedNotificationState() {
  if (!Array.isArray(state.notifications) || state.notifications.length) {
    return;
  }

  state.notifications = getNotificationSeedData();
  syncRecommendationNotifications();
  persistSavedState();
  renderNotifications();
}

function getUnreadNotificationCount() {
  if (!Array.isArray(state.notifications)) {
    return 0;
  }

  return state.notifications.filter((notification) => !notification.dismissed && notification.unread).length;
}

function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) return "Just now";
  if (diffMs < hourMs) return `${Math.max(1, Math.round(diffMs / minuteMs))}m ago`;
  if (diffMs < dayMs) return `${Math.max(1, Math.round(diffMs / hourMs))}h ago`;
  return `${Math.max(1, Math.round(diffMs / dayMs))}d ago`;
}

function renderNotificationBadge() {
  const button = document.getElementById("notification-button");
  const badge = document.getElementById("notification-badge");
  const unreadCount = getUnreadNotificationCount();

  if (!button || !badge) return;

  if (unreadCount > 0) {
    badge.textContent = String(unreadCount);
    badge.classList.remove("hidden");
    button.setAttribute("aria-label", `Open notifications, ${unreadCount} unread`);
  } else {
    badge.textContent = "0";
    badge.classList.add("hidden");
    button.setAttribute("aria-label", "Open notifications");
  }
}

function renderNotifications() {
  const list = document.getElementById("notification-list");
  const emptyState = document.getElementById("notification-empty");
  const notificationCenter = document.getElementById("notification-center");
  renderNotificationBadge();

  if (!list || !emptyState || !notificationCenter) return;

  const items = [...(state.notifications || [])]
    .filter((notification) => !notification.dismissed)
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));

  if (!items.length) {
    list.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  list.innerHTML = items.map((notification) => {
    const typeLabel = notification.type === "message" ? "Message" : notification.type === "recommendation" ? "Recommendation" : "Activity";
    const icon = notification.type === "message" ? (notification.avatar || "A") : notification.type === "recommendation" ? "✦" : "•";
    const className = notification.unread ? "is-unread" : "";

    return `
      <article class="notification-card ${className}" data-notification-id="${notification.id}" tabindex="0">
        <div class="notification-avatar ${notification.type}">${icon}</div>
        <div class="notification-copy">
          <div class="notification-meta-row">
            <span class="notification-type">${typeLabel}</span>
            <span class="notification-time">${formatRelativeTime(notification.timestamp)}</span>
          </div>
          <h3>${notification.title}</h3>
          <p>${notification.description}</p>
        </div>
        <div class="notification-actions">
          <button class="notification-action subtle" type="button" data-read-id="${notification.id}">${notification.unread ? "Read" : "Open"}</button>
          <button class="notification-action danger" type="button" data-dismiss-id="${notification.id}">Dismiss</button>
        </div>
      </article>
    `;
  }).join("");

  list.querySelectorAll(".notification-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        return;
      }

      const id = card.dataset.notificationId;
      if (!id) return;
      handleNotificationSelection(id);
    });
  });

  list.querySelectorAll("[data-read-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.readId;
      handleNotificationSelection(id);
    });
  });

  list.querySelectorAll("[data-dismiss-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.dismissId;
      const target = state.notifications.find((notification) => notification.id === id);
      if (!target) return;
      target.dismissed = true;
      persistSavedState();
      renderNotifications();
    });
  });
}

function openNotificationCenter() {
  const center = document.getElementById("notification-center");
  const button = document.getElementById("notification-button");
  if (!center || !button) return;

  center.classList.remove("hidden");
  center.setAttribute("aria-hidden", "false");
  button.setAttribute("aria-expanded", "true");
  renderNotifications();
}

function closeNotificationCenter() {
  const center = document.getElementById("notification-center");
  const button = document.getElementById("notification-button");
  if (!center || !button) return;

  center.classList.add("hidden");
  center.setAttribute("aria-hidden", "true");
  button.setAttribute("aria-expanded", "false");
  const detail = document.getElementById("notification-detail");
  if (detail) {
    detail.classList.add("hidden");
    detail.innerHTML = "";
  }
}

function showNotificationDetail(notification) {
  const detail = document.getElementById("notification-detail");
  if (!detail) return;

  if (notification.type === "message") {
    const conversation = Array.isArray(notification.conversation) && notification.conversation.length
      ? notification.conversation
      : [
          { author: notification.from || "Inabowt", text: notification.description },
          { author: "You", text: "I’m on it. See you soon." }
        ];

    detail.innerHTML = `
      <div class="notification-detail-panel">
        <div class="notification-detail-header">
          <div class="notification-avatar message">${notification.avatar || "A"}</div>
          <div>
            <span class="notification-type">Message</span>
            <h3>${notification.title}</h3>
          </div>
          <button type="button" class="notification-close-detail" data-close-notification-detail>×</button>
        </div>
        <div class="notification-thread">
          ${conversation.map((entry) => `
            <div class="notification-thread-item ${entry.author === "You" ? "is-self" : ""}">
              <strong>${entry.author}</strong>
              <p>${entry.text}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  } else {
    const destinationLabel = notification.outingId ? "Open outing details" : notification.invitationId ? "Open invitation" : "See in app";
    detail.innerHTML = `
      <div class="notification-detail-panel">
        <div class="notification-detail-header">
          <div class="notification-avatar ${notification.type}">${notification.type === "recommendation" ? "✦" : "•"}</div>
          <div>
            <span class="notification-type">${notification.type === "recommendation" ? "Recommendation" : "Update"}</span>
            <h3>${notification.title}</h3>
          </div>
          <button type="button" class="notification-close-detail" data-close-notification-detail>×</button>
        </div>
        <p class="notification-detail-copy">${notification.description}</p>
        <button type="button" class="primary-button notification-detail-button" data-open-notification-target="${notification.id}">${destinationLabel}</button>
      </div>
    `;
  }

  detail.classList.remove("hidden");

  const closeButton = detail.querySelector("[data-close-notification-detail]");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      detail.classList.add("hidden");
      detail.innerHTML = "";
    });
  }

  const openButton = detail.querySelector("[data-open-notification-target]");
  if (openButton) {
    openButton.addEventListener("click", () => {
      const id = openButton.dataset.openNotificationTarget;
      handleNotificationSelection(id);
    });
  }
}

function handleNotificationSelection(notificationId) {
  const target = state.notifications.find((notification) => notification.id === notificationId);
  if (!target) return;

  target.unread = false;
  persistSavedState();
  renderNotifications();

  if (target.type === "message") {
    showNotificationDetail(target);
    return;
  }

  const outingId = target.outingId || target.destination?.outingId;
  const invitationId = target.invitationId;

  if (outingId) {
    closeNotificationCenter();
    openEventDetails(outingId);
    return;
  }

  if (invitationId) {
    closeNotificationCenter();
    state.activePlansTab = "INVITATIONS";
    syncPlanSelection();
    renderPlansScreen();
    setActiveScreen("plans");
    return;
  }

  if (target.type === "recommendation") {
    closeNotificationCenter();
    setActiveScreen("discover");
    return;
  }

  showNotificationDetail(target);
}

function markAllNotificationsRead() {
  state.notifications = (state.notifications || []).map((notification) => ({
    ...notification,
    unread: false
  }));
  persistSavedState();
  renderNotifications();
}

function createOutingNotification(type, outing, extra) {
  const base = {
    id: `activity-${type}-${outing.id}-${Date.now()}`,
    type: "activity",
    title: extra.title,
    description: extra.description,
    timestamp: new Date().toISOString(),
    unread: true,
    dismissed: false,
    avatar: "•",
    source: "activity",
    from: "Inabowt",
    outingId: outing.id,
    destination: { screen: "plans", outingId: outing.id }
  };

  addNotification(base);
}

function syncActivityNotificationsForInvite(invite, action) {
  const event = getEventById(invite.eventId);
  const title = action === "accept"
    ? "Invitation accepted"
    : "Invitation declined";
  const description = action === "accept"
    ? `You accepted the invite for ${event?.title || invite.title}.`
    : `You declined the invite for ${event?.title || invite.title}.`;

  addNotification({
    id: `invite-${action}-${invite.id}`,
    type: "activity",
    title,
    description,
    timestamp: new Date().toISOString(),
    unread: true,
    dismissed: false,
    avatar: "•",
    source: "activity",
    from: "Inabowt",
    outingId: invite.eventId,
    invitationId: invite.id,
    destination: { screen: "plans", invitationId: invite.id }
  });
}

function syncRecommendationAfterProfileUpdate() {
  const existingRecommendationIds = new Set((state.notifications || []).filter((item) => item.type === "recommendation").map((item) => item.outingId).filter(Boolean));
  const recommendations = buildRecommendationNotifications();
  recommendations.forEach((item) => {
    if (!existingRecommendationIds.has(item.outingId)) {
      state.notifications.unshift(normalizeNotificationEntry(item));
    }
  });
  persistSavedState();
  renderNotifications();
}

function ensureNotificationReady() {
  if (!state.notifications || !Array.isArray(state.notifications)) {
    state.notifications = [];
  }

  if (!state.notifications.length) {
    seedNotificationState();
  }

  syncRecommendationNotifications();
  renderNotifications();
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

function normalizeLocationText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getLocationCoords(outing) {
  const direct = outing?.coordinates;
  if (direct && typeof direct.lat === "number" && typeof direct.lng === "number") {
    return { lat: direct.lat, lng: direct.lng, type: direct.type || "exact address" };
  }

  const candidateValues = [outing?.address, outing?.location]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => String(value).trim());

  const normalizedCandidates = candidateValues.map(normalizeLocationText);

  const exactMatch = Object.entries(locationCoordinates).find(([key, value]) => {
    const normalizedKey = normalizeLocationText(key);
    return normalizedCandidates.some((candidate) => candidate === normalizedKey || candidate.includes(normalizedKey) || normalizedKey.includes(candidate));
  });

  if (exactMatch) {
    const [, coords] = exactMatch;
    return { lat: coords.lat, lng: coords.lng, type: coords.type || "area" };
  }

  const downtownFallback = { lat: 36.1699, lng: -115.1398, type: "area" };
  const addressText = candidateValues.join(" ");
  if (addressText && /las vegas|vegas|summerlin|strip|downtown|arts district|fremont|green valley|lake mead|red rock/i.test(addressText)) {
    return downtownFallback;
  }

  return { lat: downtownFallback.lat, lng: downtownFallback.lng, type: downtownFallback.type || "area" };
}

function normalizePublicTags(rawTags) {
  const rawText = Array.isArray(rawTags)
    ? rawTags.join(" ")
    : String(rawTags || "");

  const candidates = rawText
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const normalized = candidates
    .map((tag) => String(tag || "").trim())
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

function getApprovedPublicTags(rawTags) {
  const tags = normalizePublicTags(rawTags || []);
  return Array.from(new Set(tags.filter((tag) => tag && !/\s/.test(tag)))).slice(0, 3);
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
  renderNewsFeed();

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

  const entries = Array.isArray(window.demoNewsFeed) ? window.demoNewsFeed : [];
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
        .map((entry) => {
          const label = entry.label || (entry.kind === "story" ? "Demo success story" : "Demo private community update");
          return `
            <article class="news-card ${entry.kind === "story" ? "story" : "activity"}">
              <div class="news-card-top">
                <span class="news-card-tag">${label}</span>
              </div>
              <h3>${entry.title}</h3>
              <p>${entry.description}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderProfileScreen() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  const profile = state.userProfile || getDefaultUserProfile();
  const displayNameInput = document.getElementById("profile-display-name");
  const bioInput = document.getElementById("profile-bio");
  const neighborhoodInput = document.getElementById("profile-neighborhood");
  const radiusInput = document.getElementById("profile-activity-radius");
  const bioCounter = document.getElementById("profile-bio-counter");
  const photoPreview = document.getElementById("profile-photo-preview");
  const photoInput = document.getElementById("profile-photo-input");

  if (displayNameInput) displayNameInput.value = profile.displayName || "";
  if (bioInput) bioInput.value = profile.bio || "";
  if (neighborhoodInput) neighborhoodInput.value = profile.neighborhood || "";
  if (radiusInput) radiusInput.value = profile.activityRadius || "10";
  if (bioCounter) bioCounter.textContent = `${(profile.bio || "").length}/180`;

  document.querySelectorAll(".profile-interest-option").forEach((checkbox) => {
    checkbox.checked = Array.isArray(profile.interests) && profile.interests.includes(checkbox.value);
  });

  document.querySelectorAll(".profile-availability-option").forEach((checkbox) => {
    checkbox.checked = Array.isArray(profile.availability) && profile.availability.includes(checkbox.value);
  });

  if (photoPreview) {
    if (profile.photo) {
      photoPreview.style.backgroundImage = `url('${profile.photo.replace(/'/g, "\\'")}' )`;
      photoPreview.classList.add("has-photo");
    } else {
      photoPreview.style.backgroundImage = "linear-gradient(135deg, rgba(8, 102, 255, 0.7), rgba(0, 217, 255, 0.35))";
      photoPreview.classList.remove("has-photo");
    }
  }

  if (photoInput) {
    photoInput.value = "";
  }
}

function readProfileFormValues() {
  const profile = state.userProfile || getDefaultUserProfile();

  const interests = Array.from(document.querySelectorAll(".profile-interest-option:checked")).map((checkbox) => checkbox.value);
  const availability = Array.from(document.querySelectorAll(".profile-availability-option:checked")).map((checkbox) => checkbox.value);

  return {
    ...profile,
    displayName: document.getElementById("profile-display-name")?.value.trim() || "",
    bio: document.getElementById("profile-bio")?.value.trim() || "",
    neighborhood: document.getElementById("profile-neighborhood")?.value.trim() || "",
    interests,
    availability,
    activityRadius: document.getElementById("profile-activity-radius")?.value || "10"
  };
}

function showProfileToast(message) {
  const toast = document.getElementById("profile-save-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showProfileToast.timeoutId);
  showProfileToast.timeoutId = setTimeout(() => {
    toast.classList.add("hidden");
  }, 1800);
}

function handleProfilePhotoSelection(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    state.userProfile = {
      ...(state.userProfile || getDefaultUserProfile()),
      photo: typeof reader.result === "string" ? reader.result : ""
    };
    renderProfileScreen();
    persistSavedState();
  };
  reader.readAsDataURL(file);
}

function handleProfilePhotoRemoval() {
  state.userProfile = {
    ...(state.userProfile || getDefaultUserProfile()),
    photo: ""
  };
  renderProfileScreen();
  persistSavedState();
  showProfileToast("Photo removed");
}

function handleProfileSave(event) {
  event.preventDefault();
  const profile = readProfileFormValues();
  state.userProfile = {
    ...getDefaultUserProfile(),
    ...profile,
    interests: Array.isArray(profile.interests) ? profile.interests : [],
    availability: Array.isArray(profile.availability) ? profile.availability : []
  };
  persistSavedState();
  syncRecommendationAfterProfileUpdate();
  renderProfileScreen();
  showProfileToast("Profile saved");
}

function renderCalendarView() {
  const calendarGrid = document.getElementById("calendar-grid");
  const monthLabel = document.getElementById("calendar-month-label");
  const calendarShell = document.querySelector(".calendar-shell");
  if (!calendarGrid || !monthLabel || !calendarShell) return;

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
      <button type="button" class="${dayClass}" data-calendar-date="${isoDate}" ${eventsForDate.length ? `aria-label="${eventsForDate.length} events on ${isoDate}"` : ""}>
        <span class="calendar-day-number">${date.getDate()}</span>
        ${eventsForDate.length ? `<span class="calendar-day-badge">${eventsForDate.length}</span>` : ""}
      </button>
    `);
  }

  calendarGrid.innerHTML = cells.join("");

  const selectedEvents = visibleEvents.filter((outing) => {
    const outingDate = new Date(parseDateTime(outing.date));
    return outingDate.toISOString().slice(0, 10) === selectedDate;
  });

  let popupElement = document.getElementById("calendar-day-popover");
  if (!popupElement) {
    popupElement = document.createElement("div");
    popupElement.id = "calendar-day-popover";
    popupElement.className = "calendar-day-popover hidden";
    calendarShell.appendChild(popupElement);
  }

  if (selectedEvents.length) {
    popupElement.classList.remove("hidden");
    popupElement.innerHTML = `
      <div class="calendar-day-popover-header">
        <strong>${new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${selectedDate}T12:00:00`))}</strong>
        <button type="button" class="calendar-day-popover-close" data-calendar-close>Close</button>
      </div>
      <div class="calendar-day-popover-list">
        ${selectedEvents
          .map((outing) => `
            <button type="button" class="calendar-day-popover-item" data-calendar-event-id="${outing.id}">
              <span class="calendar-day-popover-title">${outing.title}</span>
              <span class="calendar-day-popover-time">${formatTime(outing.date)}</span>
            </button>
          `)
          .join("")}
      </div>
    `;

    const closeButton = popupElement.querySelector("[data-calendar-close]");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        popupElement.classList.add("hidden");
      });
    }

    popupElement.querySelectorAll("[data-calendar-event-id]").forEach((button) => {
      button.addEventListener("click", () => {
        openEventDetails(button.dataset.calendarEventId);
      });
    });
  } else {
    popupElement.classList.add("hidden");
    popupElement.innerHTML = "";
  }

  calendarGrid.querySelectorAll(".calendar-day").forEach((button) => {
    button.addEventListener("click", () => {
      const nextDate = button.dataset.calendarDate;
      state.calendarSelectedDate = nextDate;
      renderCalendarView();
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

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      noWrap: true,
      subdomains: "abc"
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
        syncActivityNotificationsForInvite(invite, "accept");
      }

      if (button.dataset.inviteAction === "decline") {
        state.invitationStatus[invite.eventId] = "DECLINED";
        syncActivityNotificationsForInvite(invite, "decline");
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
        ${getApprovedPublicTags(event.tags || publicTags).map((tag) => `<span class="detail-tag">${tag}</span>`).join("")}
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
      const activityTitle = outingType === "OPEN_OUTING"
        ? "You joined an outing"
        : "You expressed interest in an outing";
      const activityDescription = outingType === "OPEN_OUTING"
        ? `You joined ${event.title}. Your plans are now updated.`
        : `You expressed interest in ${event.title}. The host will review it.`;

      addNotification({
        id: `activity-user-${event.id}-${Date.now()}`,
        type: "activity",
        title: activityTitle,
        description: activityDescription,
        timestamp: new Date().toISOString(),
        unread: true,
        dismissed: false,
        avatar: "•",
        source: "activity",
        from: "Inabowt",
        outingId: event.id,
        destination: { screen: "plans", outingId: event.id }
      });
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
      errors[tagErrorField] = "Please add exactly three unique one-word tags.";
    } else if (new Set(data[tagFieldName].map((tag) => tag.toLowerCase())).size !== 3) {
      errors[tagErrorField] = "Tags must be unique and one word each.";
    } else if (data[tagFieldName].some((tag) => !tag || /\s/.test(tag))) {
      errors[tagErrorField] = "Tags must be exactly three nonempty one-word values.";
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
  renderDiscoverContent();
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

  if (screenName === "discover") {
    renderDiscoverContent();
  }

  if (screenName === "profile") {
    renderProfileScreen();
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

const notificationButton = document.getElementById("notification-button");
if (notificationButton) {
  notificationButton.addEventListener("click", () => {
    const center = document.getElementById("notification-center");
    if (!center) return;
    if (center.classList.contains("hidden")) {
      openNotificationCenter();
    } else {
      closeNotificationCenter();
    }
  });
}

const notificationCloseButton = document.getElementById("notification-close");
if (notificationCloseButton) {
  notificationCloseButton.addEventListener("click", closeNotificationCenter);
}

const markAllReadButton = document.getElementById("mark-all-read");
if (markAllReadButton) {
  markAllReadButton.addEventListener("click", markAllNotificationsRead);
}

const notificationList = document.getElementById("notification-list");
if (notificationList) {
  notificationList.addEventListener("click", (event) => {
    const readButton = event.target.closest("[data-read-id]");
    if (readButton) {
      event.stopPropagation();
      handleNotificationSelection(readButton.dataset.readId);
      return;
    }

    const dismissButton = event.target.closest("[data-dismiss-id]");
    if (dismissButton) {
      event.stopPropagation();
      const target = state.notifications.find((notification) => notification.id === dismissButton.dataset.dismissId);
      if (target) {
        target.dismissed = true;
        persistSavedState();
        renderNotifications();
      }
      return;
    }

    const card = event.target.closest(".notification-card");
    if (card) {
      handleNotificationSelection(card.dataset.notificationId);
    }
  });
}

const notificationDetail = document.getElementById("notification-detail");
if (notificationDetail) {
  notificationDetail.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-close-notification-detail]");
    if (closeButton) {
      event.stopPropagation();
      notificationDetail.classList.add("hidden");
      notificationDetail.innerHTML = "";
    }
  });
}

document.getElementById("open-create-placeholder").addEventListener("click", handleOpenCreatePlaceholder);

const profileForm = document.getElementById("profile-form");
if (profileForm) {
  profileForm.addEventListener("submit", handleProfileSave);
}

const profilePhotoInput = document.getElementById("profile-photo-input");
if (profilePhotoInput) {
  profilePhotoInput.addEventListener("change", handleProfilePhotoSelection);
}

const profilePhotoRemoveButton = document.getElementById("profile-photo-remove");
if (profilePhotoRemoveButton) {
  profilePhotoRemoveButton.addEventListener("click", handleProfilePhotoRemoval);
}

const profileBioInput = document.getElementById("profile-bio");
if (profileBioInput) {
  profileBioInput.addEventListener("input", (event) => {
    const counter = document.getElementById("profile-bio-counter");
    if (counter) {
      counter.textContent = `${event.target.value.length}/180`;
    }
  });
}

const profileResetButton = document.getElementById("profile-reset-button");
if (profileResetButton) {
  profileResetButton.addEventListener("click", () => {
    state.userProfile = getDefaultUserProfile();
    persistSavedState();
    renderProfileScreen();
    showProfileToast("Profile reset");
  });
}

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

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const modalOpen = detailsModal && !detailsModal.classList.contains("hidden")
      || createModal && !createModal.classList.contains("hidden");
    if (modalOpen) return;

    const anyDropdownOpen = Array.from(document.querySelectorAll("[data-nav-dropdown] .nav-dropdown-menu")).some((menu) => !menu.classList.contains("hidden"));
    if (!anyDropdownOpen) return;

    closeNavDropdowns();
  });

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

renderProfileScreen();
renderTypeToggle();
renderDiscoverView();
resetCreateForm();
renderDiscoverContent();
renderPlansScreen();
ensureNotificationReady();
setActiveScreen("discover");
