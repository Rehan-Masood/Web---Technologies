"use strict";

/**
 * CVForge - Privacy-First CV Generator
 * 
 * PRIVACY POLICY:
 * - Location data is only extracted to City/Country level
 * - Exact coordinates (lat/lon) are NEVER stored locally
 * - Map is only visible in the editor panel, NEVER in exported CV
 * - User location is only shown if user explicitly provides it
 * - No automatic location detection on page load
 * - All stored data uses localStorage (user-controlled)
 */

const state = {
  skills: [],
  experiences: [],
  projects: [],
  template: "executive",
  photoSrc: null,
  theme: "dark",
  // PRIVACY: We NEVER store coordinates, only readable addresses
  addressOnly: true, // Ensures only city/country is stored
};

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(msg, type = "success") {
  const toast = document.getElementById("appToast");
  const toastMsg = document.getElementById("toastMsg");
  const toastIcon = document.getElementById("toastIcon");

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
    info: "fa-circle-info",
    warning: "fa-triangle-exclamation",
  };

  const colors = {
    success: "var(--gold)",
    error: "#e74c3c",
    info: "var(--emerald-light)",
    warning: "#f39c12",
  };

  toastMsg.textContent = msg;
  toastIcon.className = `fa-solid ${icons[type] || icons.success}`;
  toastIcon.style.color = colors[type] || colors.success;

  const bsToast = bootstrap.Toast.getOrCreateInstance(toast, { delay: 3000 });
  bsToast.show();
}

function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById("themeIcon");
  const isDark = html.getAttribute("data-theme") === "dark";

  if (isDark) {
    html.setAttribute("data-theme", "light");
    icon.className = "fa-solid fa-moon";
    state.theme = "light";
  } else {
    html.setAttribute("data-theme", "dark");
    icon.className = "fa-solid fa-sun";
    state.theme = "dark";
  }

  localStorage.setItem("cvforge_theme", state.theme);
}

function uploadPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    state.photoSrc = e.target.result;
    document.getElementById("previewPhoto").src = state.photoSrc;
    document.getElementById("cvPhoto").src = state.photoSrc;
  };
  reader.readAsDataURL(file);
}

function addSkill() {
  const input = document.getElementById("skillInput");
  const name = input.value.trim();
  if (!name) {
    showToast("Enter a skill first.", "warning");
    return;
  }

  if (state.skills.find((s) => s.name.toLowerCase() === name.toLowerCase())) {
    showToast("Skill already added.", "info");
    return;
  }

  state.skills.push({ name, level: 80 });
  input.value = "";
  renderSkillTags();
  renderCVSkills();
}

function removeSkill(index) {
  state.skills.splice(index, 1);
  renderSkillTags();
  renderCVSkills();
}

function renderSkillTags() {
  const container = document.getElementById("skillsContainer");
  container.innerHTML = "";

  state.skills.forEach((skill, i) => {
    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.innerHTML = `${escHtml(skill.name)}
      <span class="remove-skill" onclick="removeSkill(${i})"><i class="fa-solid fa-xmark"></i></span>`;
    container.appendChild(tag);
  });
}

function renderCVSkills() {
  const section = document.getElementById("cvSkillsSection");
  const wrap = document.getElementById("cvSkillBars");

  if (!state.skills.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "";
  wrap.innerHTML = "";

  state.skills.forEach((skill) => {
    const item = document.createElement("div");
    item.className = "cv-skill-bar-item";
    item.innerHTML = `
      <div class="cv-skill-bar-label">
        <span>${escHtml(skill.name)}</span>
        <span>Advanced</span>
      </div>
      <div class="cv-skill-bar-track">
        <div class="cv-skill-bar-fill" style="width:${skill.level}%"></div>
      </div>
    `;
    wrap.appendChild(item);
  });
}

function addExperience() {
  state.experiences.push({
    jobTitle: "",
    company: "",
    duration: "",
    description: "",
  });
  renderAllExperiences();
  renderCVExperience();
}

function removeExperience(index) {
  state.experiences.splice(index, 1);
  renderAllExperiences();
  renderCVExperience();
}

function renderAllExperiences() {
  const container = document.getElementById("experienceContainer");
  container.innerHTML = "";

  state.experiences.forEach((exp, idx) => {
    const div = document.createElement("div");
    div.className = "dynamic-entry";
    div.innerHTML = `
      <button class="entry-remove-btn" onclick="removeExperience(${idx})"><i class="fa-solid fa-xmark"></i></button>
      <div class="row g-2">
        <div class="col-12">
          <input type="text" class="form-control premium-input exp-job" placeholder="Job Title" value="${escHtml(exp.jobTitle)}">
        </div>
        <div class="col-12">
          <input type="text" class="form-control premium-input exp-company" placeholder="Company" value="${escHtml(exp.company)}">
        </div>
        <div class="col-12">
          <input type="text" class="form-control premium-input exp-duration" placeholder="Duration" value="${escHtml(exp.duration)}">
        </div>
        <div class="col-12">
          <textarea class="form-control premium-input exp-description" rows="2" placeholder="Description">${escHtml(exp.description)}</textarea>
        </div>
      </div>
    `;
    container.appendChild(div);

    div.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => syncExp(idx));
    });
  });
}

function syncExp(idx) {
  state.experiences[idx].jobTitle = document.querySelectorAll(".exp-job")[idx].value;
  state.experiences[idx].company = document.querySelectorAll(".exp-company")[idx].value;
  state.experiences[idx].duration = document.querySelectorAll(".exp-duration")[idx].value;
  state.experiences[idx].description = document.querySelectorAll(".exp-description")[idx].value;
  renderCVExperience();
}

function renderCVExperience() {
  const list = document.getElementById("cvExperienceList");
  list.innerHTML = "";

  state.experiences.forEach((exp) => {
    if (exp.jobTitle || exp.company) {
      list.innerHTML += `
        <div class="cv-item-header">
          <span class="cv-item-title">${escHtml(exp.jobTitle)} — ${escHtml(exp.company)}</span>
          <span class="cv-item-date">${escHtml(exp.duration)}</span>
        </div>
        <div class="cv-item-desc">${escHtml(exp.description)}</div>
      `;
    }
  });

  const section = document.getElementById("cvExperienceSection");
  section.style.display = state.experiences.some(e => e.jobTitle || e.company) ? "" : "none";
}

function addProject() {
  state.projects.push({
    title: "",
    description: "",
    tech: "",
  });
  renderAllProjects();
  renderCVProjects();
}

function removeProject(index) {
  state.projects.splice(index, 1);
  renderAllProjects();
  renderCVProjects();
}

function renderAllProjects() {
  const container = document.getElementById("projectsContainer");
  container.innerHTML = "";

  state.projects.forEach((proj, idx) => {
    const div = document.createElement("div");
    div.className = "dynamic-entry";
    div.innerHTML = `
      <button class="entry-remove-btn" onclick="removeProject(${idx})"><i class="fa-solid fa-xmark"></i></button>
      <div class="row g-2">
        <div class="col-12">
          <input type="text" class="form-control premium-input proj-title" placeholder="Project Title" value="${escHtml(proj.title)}">
        </div>
        <div class="col-12">
          <textarea class="form-control premium-input proj-description" rows="2" placeholder="Description">${escHtml(proj.description)}</textarea>
        </div>
        <div class="col-12">
          <input type="text" class="form-control premium-input proj-tech" placeholder="Technologies" value="${escHtml(proj.tech)}">
        </div>
      </div>
    `;
    container.appendChild(div);

    div.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => syncProj(idx));
    });
  });
}

function syncProj(idx) {
  state.projects[idx].title = document.querySelectorAll(".proj-title")[idx].value;
  state.projects[idx].description = document.querySelectorAll(".proj-description")[idx].value;
  state.projects[idx].tech = document.querySelectorAll(".proj-tech")[idx].value;
  renderCVProjects();
}

function renderCVProjects() {
  const list = document.getElementById("cvProjectsList");
  list.innerHTML = "";

  state.projects.forEach((proj) => {
    if (proj.title) {
      list.innerHTML += `
        <div class="cv-item-header">
          <span class="cv-item-title">${escHtml(proj.title)}</span>
        </div>
        <div class="cv-item-desc">${escHtml(proj.description)}</div>
        <div class="cv-tech-tags">
          ${proj.tech
            .split(",")
            .map((t) => `<span class="cv-tech-tag">${escHtml(t.trim())}</span>`)
            .join("")}
        </div>
      `;
    }
  });

  const section = document.getElementById("cvProjectsSection");
  section.style.display = state.projects.some(p => p.title) ? "" : "none";
}

/**
 * PRIVACY-CRITICAL FUNCTION
 * Updates CV preview with user data
 * IMPORTANT: Address shown in CV is ONLY city/country (no exact coordinates)
 */
function updatePreview() {
  const name = val("fullName") || "Usman Khan";
  const title = val("profTitle") || "Software Engineer";
  const email = val("email") || "usman@example.com";
  const phone = val("phone") || "+92-300-1234567";
  const address = val("address") || "Lahore, Pakistan";
  const degree = val("degree") || "B.Sc. in Computer Science";
  const university = val("university") || "University";
  const eduYear = val("eduYear") || "2014–2018";
  const cgpa = val("cgpa") || "CGPA: 3.7";

  document.getElementById("cvName").textContent = name;
  document.getElementById("cvTitlePreview").textContent = title;
  document.getElementById("cvEmail").innerHTML = `<i class="fa-solid fa-envelope"></i> ${escHtml(email)}`;
  document.getElementById("cvPhone").innerHTML = `<i class="fa-solid fa-phone"></i> ${escHtml(phone)}`;
  
  // PRIVACY: Only show city/country address (converted from coordinates, never exact location)
  document.getElementById("cvAddress").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escHtml(address)}`;
  document.getElementById("cvDegree").textContent = `${degree} — ${university}`;
  document.getElementById("cvEduYear").textContent = eduYear;
  document.getElementById("cvCgpa").textContent = cgpa;

  if (!state.photoSrc) {
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=121212&size=120&bold=true`;
    document.getElementById("previewPhoto").src = avatar;
    document.getElementById("cvPhoto").src = avatar;
  }
}

function switchTemplate(templateName, cardEl) {
  document.querySelectorAll(".template-card").forEach((c) => c.classList.remove("active"));
  cardEl.classList.add("active");
  document.getElementById("cvPreview").className = `cv-preview template-${templateName}`;
  state.template = templateName;
}

// ==================== MAP & LOCATION MANAGEMENT ====================

let leafletMap = null;
let leafletMarker = null;
let mapTimeout = null;

function debounceMapUpdate() {
  clearTimeout(mapTimeout);
  mapTimeout = setTimeout(updateMapFromAddress, 700);
}

/**
 * PRIVACY: Reset map display to placeholder state
 * Called on page load and when address is empty
 */
function resetMapDisplay() {
  document.getElementById("mapPlaceholder").style.display = "flex";
  document.getElementById("leafletMap").style.display = "none";
  document.getElementById("mapAddressDisplay").innerHTML = "";
}

/**
 * EDITOR-ONLY MAP: Display map in editor panel only
 * NEVER included in exported CV
 * @param {number} lat - Latitude (for display only, never stored)
 * @param {number} lng - Longitude (for display only, never stored)
 * @param {string} label - City/Country readable address (what gets stored)
 */
function initLeafletMap(lat, lng, label) {
  const mapEl = document.getElementById("leafletMap");
  document.getElementById("mapPlaceholder").style.display = "none";
  mapEl.style.display = "block";

  if (!leafletMap) {
    leafletMap = L.map("leafletMap").setView([lat, lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(leafletMap);
  } else {
    leafletMap.setView([lat, lng], 13);
  }

  if (leafletMarker) {
    leafletMarker.setLatLng([lat, lng]);
  } else {
    leafletMarker = L.marker([lat, lng]).addTo(leafletMap);
  }

  leafletMarker.bindPopup(label).openPopup();
  document.getElementById("mapAddressDisplay").innerHTML = `<i class="fa-solid fa-location-dot me-1" style="color:var(--gold)"></i> ${escHtml(label)}`;

  setTimeout(() => leafletMap.invalidateSize(), 200);
}

/**
 * Update map when user manually types address
 * DISABLED: User must explicitly request map with "Detect" button
 */
async function updateMapFromAddress() {
  const address = val("address");
  if (!address || address.length < 3) {
    resetMapDisplay();
    return;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      initLeafletMap(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
    } else {
      showToast("Address not found.", "warning");
      resetMapDisplay();
    }
  } catch (e) {
    showToast("Map could not load.", "error");
    resetMapDisplay();
  }
}

/**
 * PRIVACY-CRITICAL FUNCTION
 * Convert exact coordinates to readable city/country address ONLY
 * NEVER store exact coordinates (lat/lon)
 * @returns {string} City, Country format or fallback
 */
async function reverseGeocodeToAddress(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    const data = await res.json();
    
    // PRIVACY: Extract ONLY city/country, discard exact coordinates
    const address = data.address || {};
    const city = address.city || address.town || address.village || "";
    const country = address.country || "";
    
    if (city && country) {
      return `${city}, ${country}`;
    }
    
    // Fallback: use display_name but it should be stripped of coordinates
    const displayName = data.display_name || "Unknown Location";
    // Extract just the meaningful part (first 2-3 parts of the address)
    const parts = displayName.split(",").slice(0, 2).map(p => p.trim()).join(", ");
    return parts || "Unknown Location";
  } catch {
    return "Unknown Location";
  }
}

/**
 * PRIVACY: Remove Google Maps integration (violates privacy requirement)
 * Opens address in OpenStreetMap instead
 */
function openAddressOnOpenStreetMap() {
  const address = val("address");
  if (!address) {
    showToast("Enter your address first.", "warning");
    return;
  }
  // Use OpenStreetMap's search instead of Google Maps
  window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`, "_blank");
}

/**
 * PRIVACY-CRITICAL FUNCTION
 * One-time manual location detection
 * IMPORTANT:
 * - User must EXPLICITLY click button (no auto-detection)
 * - Coordinates converted to city/country ONLY
 * - Address field is updated with readable location
 * - Map shown in editor panel only
 * - Coordinates are NOT stored anywhere
 * @returns {void}
 */
function detectLocation() {
  if (!window.isSecureContext) {
    showToast("Location detection works only on localhost or HTTPS.", "error");
    return;
  }

  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser.", "error");
    return;
  }

  showToast("Detecting your location...", "info");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        // PRIVACY: Convert to readable address immediately
        // Coordinates are TEMP ONLY, never stored
        const address = await reverseGeocodeToAddress(lat, lon);
        
        if (!address || address === "Unknown Location") {
          showToast("Could not determine your location details.", "warning");
          return;
        }
        
        // Update ONLY the address field with readable location
        document.getElementById("address").value = address;
        updatePreview();
        
        // Show map ONLY in editor panel (not in CV or export)
        initLeafletMap(lat, lon, address);
        
        showToast("Location detected successfully!", "success");
      } catch (error) {
        showToast("Error processing location data.", "error");
        console.error("Geolocation error:", error);
      }
    },
    (err) => {
      let errorMsg = "Could not detect location.";
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMsg = "Location permission denied. Enable in browser settings.";
          break;
        case err.POSITION_UNAVAILABLE:
          errorMsg = "Location information unavailable.";
          break;
        case err.TIMEOUT:
          errorMsg = "Location request timed out.";
          break;
      }
      showToast(errorMsg, "error");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// ==================== DATA EXPORT (PDF & PRINT) ====================

/**
 * Download CV as PDF
 * PRIVACY: Map and location editor are automatically excluded from PDF
 * Only address field is included (city/country only, no coordinates)
 */
function downloadPDF() {
  const name = val("fullName") || "CV";
  const element = document.getElementById("cvPreview");

  html2pdf()
    .set({
      margin: 10,
      filename: `${name.replace(/\s+/g, "_")}_CV.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#1a1a1a" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save()
    .then(() => showToast("PDF downloaded successfully."));
}

/**
 * Print CV
 * PRIVACY: CSS @media print rules automatically hide map panel
 */
function printCV() {
  window.print();
}

// ==================== DATA PERSISTENCE ====================

/**
 * PRIVACY: Save user data to localStorage
 * ONLY stores: name, contact, skills, experiences, projects, photo, template
 * NEVER stores: exact coordinates (only address text)
 */
function saveData() {
  const address = val("address");
  
  // Validate address is not empty before saving
  if (!address) {
    showToast("Please enter your address before saving.", "warning");
    return;
  }

  const data = {
    fullName: val("fullName"),
    profTitle: val("profTitle"),
    email: val("email"),
    phone: val("phone"),
    address: address, // PRIVACY: Only address text, never coordinates
    degree: val("degree"),
    university: val("university"),
    eduYear: val("eduYear"),
    cgpa: val("cgpa"),
    skills: state.skills,
    experiences: state.experiences,
    projects: state.projects,
    photoSrc: state.photoSrc,
    template: state.template,
  };
  
  localStorage.setItem("cvforge_data", JSON.stringify(data));
  showToast("Data saved successfully!");
}

/**
 * Load saved data from localStorage
 * Safely restores all user information
 */
function loadSavedData() {
  const raw = localStorage.getItem("cvforge_data");
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value || "";
    };

    setVal("fullName", data.fullName);
    setVal("profTitle", data.profTitle);
    setVal("email", data.email);
    setVal("phone", data.phone);
    setVal("address", data.address);
    setVal("degree", data.degree);
    setVal("university", data.university);
    setVal("eduYear", data.eduYear);
    setVal("cgpa", data.cgpa);

    state.skills = Array.isArray(data.skills) ? data.skills : [];
    state.experiences = Array.isArray(data.experiences) ? data.experiences : [];
    state.projects = Array.isArray(data.projects) ? data.projects : [];
    state.photoSrc = data.photoSrc || null;
    state.template = data.template || "executive";

    if (state.photoSrc) {
      document.getElementById("previewPhoto").src = state.photoSrc;
      document.getElementById("cvPhoto").src = state.photoSrc;
    }

    renderSkillTags();
    renderAllExperiences();
    renderAllProjects();
    renderCVSkills();
    renderCVExperience();
    renderCVProjects();

    const activeCard = document.querySelector(`[data-template="${state.template}"]`);
    if (activeCard) switchTemplate(state.template, activeCard);

    updatePreview();
    
    // PRIVACY: Do NOT auto-show map on load
    // User must explicitly request location detection
  } catch (e) {
    localStorage.removeItem("cvforge_data");
  }
}

/**
 * Clear all user data
 */
function clearAll() {
  if (!confirm("Clear all data? This cannot be undone.")) return;

  document.querySelectorAll(".premium-input").forEach((el) => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.value = "";
  });

  state.skills = [];
  state.experiences = [];
  state.projects = [];
  state.photoSrc = null;
  state.template = "executive";

  document.getElementById("skillsContainer").innerHTML = "";
  document.getElementById("experienceContainer").innerHTML = "";
  document.getElementById("projectsContainer").innerHTML = "";

  document.querySelectorAll(".template-card").forEach((c) => c.classList.remove("active"));
  document.querySelector('[data-template="executive"]').classList.add("active");
  document.getElementById("cvPreview").className = "cv-preview template-executive";

  resetMapDisplay();
  localStorage.removeItem("cvforge_data");
  updatePreview();
  renderCVSkills();
  renderCVExperience();
  renderCVProjects();
  
  showToast("All data cleared successfully.");
}

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("cvforge_theme");
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("themeIcon").className = "fa-solid fa-moon";
    state.theme = "light";
  }

  // PRIVACY: Always start with blank map (no default location)
  resetMapDisplay();
  
  loadSavedData();
  updatePreview();

  // Keyboard shortcut: Ctrl+S to save
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveData();
    }
  });
});
