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
      participationStatus: saved.participationStatus || {},
      invitationStatus: saved.invitationStatus || {},
      activePlansTab: saved.activePlansTab || "UPCOMING",
      createdOutings: Array.isArray(saved.createdOutings) ? saved.createdOutings : [],
      createdByUser: saved.createdByUser || {},
      persistedOutings: Array.isArray(saved.persistedOutings) ? saved.persistedOutings : []
    };
  } catch (error) {
    return {
      participationStatus: {},
      invitationStatus: {},
      activePlansTab: "UPCOMING",
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
  createdOutings: [],
  createdByUser: {},
  persistedOutings: [],
  ...loadSavedState()
};

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
      participationStatus: state.participationStatus,
      invitationStatus: state.invitationStatus,
      activePlansTab: state.activePlansTab,
      createdOutings: state.createdOutings,
      createdByUser: state.createdByUser,
      persistedOutings: outings.filter((outing) => state.createdOutings.includes(outing.id))
    })
  );
}

function normalizeImageValue(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "linear-gradient(135deg, rgba(8, 102, 255, 0.72), rgba(0, 217, 255, 0.24)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 18%), linear-gradient(180deg, rgba(4, 10, 18, 0.3), rgba(4, 10, 18, 0.85))";
  }

  if (value.startsWith("url(")) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/") || value.startsWith("assets/")) {
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

function getVisibleOutings() {
  return outings.filter((outing) => {
    const outingType = normalizeOutingType(outing);
    if (outingType === "PRIVATE_OUTING") {
      return false;
    }
    const matchesType = outingType === state.activeType;
    const matchesCategory =
      state.activeCategory === "All" || outing.category === state.activeCategory;
    const haystack = `${outing.title} ${outing.location} ${outing.description} ${outing.category} ${outing.creatorName}`.toLowerCase();
    const matchesSearch = haystack.includes(state.searchTerm.toLowerCase());

    return matchesType && matchesCategory && matchesSearch;
  });
}

function getTypeBadgeClasses(type) {
  if (type === "OPEN_OUTING") return "type-badge open";
  if (type === "PRIVATE_OUTING") return "type-badge private";
  return "type-badge public";
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

function renderPlansScreen() {
  const plansContent = document.getElementById("plans-content");
  const planTabs = document.querySelectorAll(".plan-tab");

  planTabs.forEach((button) => {
    const isActive = button.dataset.planTab === state.activePlansTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const activeCreatedItems = outings.filter((outing) => state.createdOutings.includes(outing.id));
  const upcomingItems = [
    ...outings.filter((outing) => state.participationStatus[outing.id] === "JOINED"),
    ...activeCreatedItems
  ].filter((outing, index, arr) => arr.findIndex((candidate) => candidate.id === outing.id) === index);
  const pendingItems = outings.filter((outing) => state.participationStatus[outing.id] === "INTERESTED");
  const pastItems = demoPastOutings;

  let items = [];
  if (state.activePlansTab === "UPCOMING") {
    items = upcomingItems;
  } else if (state.activePlansTab === "PENDING") {
    items = pendingItems;
  } else if (state.activePlansTab === "INVITATIONS") {
    items = demoInvitations.filter((invite) => {
      const inviteStatus = state.invitationStatus[invite.eventId];
      return inviteStatus !== "ACCEPTED" && inviteStatus !== "DECLINED";
    });
  } else if (state.activePlansTab === "PAST") {
    items = pastItems;
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
  setCreateType("OPEN_OUTING");
  createPreviewPanel.classList.add("hidden");
  createPreviewPanel.innerHTML = "";
  createFormActions.classList.remove("hidden");
  createPublishActions.classList.add("hidden");
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
    privateActivities: document.getElementById("create-private-activities").value.trim(),
    privateAvailability: document.getElementById("create-private-availability").value.trim(),
    privateRadius: document.getElementById("create-private-radius").value.trim(),
    privateCriteria: document.getElementById("create-private-criteria").value.trim()
  };

  const selectedTypeButton = document.querySelector(".create-type-option.is-selected");
  data.outingType = selectedTypeButton ? selectedTypeButton.dataset.createType : "OPEN_OUTING";

  const errors = {};
  const requiredFields = [
    ["title", data.title, "Please add an outing title."],
    ["category", data.category, "Please choose a category."],
    ["description", data.description, "Please add a short description."],
    ["date", data.date, "Please choose a date."],
    ["time", data.time, "Please choose a start time."],
    ["location", data.location, "Please add a general location."],
    ["cost", data.cost, "Please add an estimated cost."],
    ["capacity", data.capacity, "Please add participant capacity."],
    ["image", data.image, "Please add a cover image or local image path."]
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
    errors.image = "Use a valid URL, local asset path, or a relative asset path.";
  }

  if (data.outingType === "PRIVATE_OUTING") {
    [
      ["privateActivities", data.privateActivities, "Please add preferred activities."],
      ["privateAvailability", data.privateAvailability, "Please add availability preferences."],
      ["privateRadius", data.privateRadius, "Please add a location radius."],
      ["privateCriteria", data.privateCriteria, "Please add invite criteria."]
    ].forEach(([field, value, message]) => {
      if (!value) errors[field] = message;
    });

    const selectedProfiles = document.querySelectorAll(".private-profile-checkbox:checked");
    if (!selectedProfiles.length) {
      errors.privateMatches = "Select at least one demo profile to preview the private invite list.";
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
  const tags = [values.category, values.location, values.outingType === "PRIVATE_OUTING" ? "Invite-only" : "Social"];

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
          <li><span class="meta-label">Where</span> ${values.location || "General location"}</li>
          <li><span class="meta-label">Budget</span> ${values.cost || "$0–$20"}</li>
        </ul>
        <p class="outing-description">${values.description || "Describe the experience."}</p>
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
    budget: values.cost.trim(),
    outingType: type,
    participationType: type,
    description: values.description.trim(),
    image: normalizeImageValue(values.image),
    tags: [
      values.category,
      type === "PRIVATE_OUTING" ? "Invite-only" : "Social",
      values.location.trim().split(" ")[0] || "Local"
    ],
    curated: false,
    creatorName: "You",
    attendance: "0 interested",
    capacity: Number(values.capacity || 12),
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

  if (screenName === "plans") {
    renderPlansScreen();
  }
}

function handleOpenCreatePlaceholder() {
  resetCreateForm();
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

document.querySelectorAll(".plan-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.activePlansTab = button.dataset.planTab;
    persistSavedState();
    renderPlansScreen();
  });
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

  const closeTrigger = event.target.closest("[data-close-modal]");
  if (!closeTrigger) return;

  const modalId = closeTrigger.dataset.closeModal;
  if (modalId === "details-modal") closeDetailsModal();
  if (modalId === "create-modal") closeCreateModal();
});

renderTypeToggle();
resetCreateForm();
renderOutings();
renderPlansScreen();
setActiveScreen("discover");
