"use strict";

/**
 * CVForge - Privacy-First CV Generator
 * 
 * PRIVACY COMMITMENT:
 * - Location data: Only city/country level (coordinates discarded)
 * - Storage: Never stores exact coordinates, geolocation data is temporary
 * - Map: Visible ONLY in editor, NOT in exported CV/PDF/Print
 * - Detection: User-triggered only, NO automatic location access
 * - External APIs: OpenStreetMap only (NO Google Maps)
 * - User Control: Full control via localStorage and browser geolocation prompts
 */

const state = {
  skills: [],
  experiences: [],
  projects: [],
  template: "executive",
  photoSrc: null,
  theme: "dark",
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
  const box = document.getElementById("experienceContainer").children[idx];
  state.experiences[idx] = {
    jobTitle: box.querySelector(".exp-job").value.trim(),
    company: box.querySelector(".exp-company").value.trim(),
    duration: box.querySelector(".exp-duration").value.trim(),
    description: box.querySelector(".exp-description").value.trim(),
  };
  renderCVExperience();
}

function renderCVExperience() {
  const section = document.getElementById("cvExperienceSection");
  const list = document.getElementById("cvExperienceList");
  const valid = state.experiences.filter((e) => e.jobTitle || e.company);

  if (!valid.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "";
  list.innerHTML = "";

  valid.forEach((exp) => {
    const div = document.createElement("div");
    div.className = "mb-3";
    div.innerHTML = `
      <div class="cv-item-header">
        <span class="cv-item-title">${escHtml(exp.jobTitle || "Job Title")}</span>
        <span class="cv-item-date">${escHtml(exp.duration)}</span>
      </div>
      <div class="cv-item-sub">${escHtml(exp.company)}</div>
      <div class="cv-item-desc">${escHtml(exp.description)}</div>
    `;
    list.appendChild(div);
  });
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
          <textarea class="form-control premium-input proj-description" rows="2" placeholder="Project Description">${escHtml(proj.description)}</textarea>
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
  const box = document.getElementById("projectsContainer").children[idx];
  state.projects[idx] = {
    title: box.querySelector(".proj-title").value.trim(),
    description: box.querySelector(".proj-description").value.trim(),
    tech: box.querySelector(".proj-tech").value.trim(),
  };
  renderCVProjects();
}

function renderCVProjects() {
  const section = document.getElementById("cvProjectsSection");
  const list = document.getElementById("cvProjectsList");
  const valid = state.projects.filter((p) => p.title || p.description);

  if (!valid.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "";
  list.innerHTML = "";

  valid.forEach((proj) => {
    const tags = proj.tech
      ? proj.tech.split(",").map((t) => `<span class="cv-tech-tag">${escHtml(t.trim())}</span>`).join("")
      : "";

    const div = document.createElement("div");
    div.className = "mb-3";
    div.innerHTML = `
      <div class="cv-item-title">${escHtml(proj.title || "Project")}</div>
      <div class="cv-item-desc">${escHtml(proj.description)}</div>
      <div class="cv-tech-tags mt-2">${tags}</div>
    `;
    list.appendChild(div);
  });
}

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

let leafletMap = null;
let leafletMarker = null;

function resetMapDisplay() {
  const placeholder = document.getElementById("mapPlaceholder");
  const mapEl = document.getElementById("leafletMap");
  const addressDisplay = document.getElementById("mapAddressDisplay");
  
  if (placeholder) placeholder.style.display = "flex";
  if (mapEl) mapEl.style.display = "none";
  if (addressDisplay) addressDisplay.innerHTML = "";
}

/**
 * Initialize Leaflet map with EXACT detected coordinates
 * Shows marker with full address and coordinates
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 * @param {string} label - Address label to display
 */
function initLeafletMap(lat, lng, label) {
  try {
    const mapEl = document.getElementById("leafletMap");
    const placeholder = document.getElementById("mapPlaceholder");
    
    if (!mapEl) {
      console.error("Map container element not found");
      return;
    }
    
    if (placeholder) placeholder.style.display = "none";
    mapEl.style.display = "block";

    // Initialize map only once for performance
    if (!leafletMap) {
      try {
        leafletMap = L.map("leafletMap").setView([lat, lng], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(leafletMap);
        console.log("✓ Leaflet map initialized");
      } catch (e) {
        console.error("Leaflet map initialization failed:", e);
        showToast("Map could not be initialized.", "error");
        return;
      }
    } else {
      leafletMap.setView([lat, lng], 15);
    }

    // Create or update marker with exact coordinates shown in popup
    const popupContent = `
      <div style="font-size: 12px; font-family: monospace; padding: 5px;">
        <strong>${escHtml(label)}</strong><br>
        <span style="color: #0f7b6c;">GPS Coordinates:</span><br>
        Lat: ${lat.toFixed(6)}<br>
        Lon: ${lng.toFixed(6)}
      </div>
    `;
    
    if (leafletMarker) {
      leafletMarker.setLatLng([lat, lng]);
      leafletMarker.setPopupContent(popupContent).openPopup();
      console.log(`✓ Marker updated to [${lat}, ${lng}]`);
    } else {
      leafletMarker = L.marker([lat, lng], {
        title: label
      }).addTo(leafletMap);
      leafletMarker.bindPopup(popupContent).openPopup();
      console.log(`✓ Marker created at [${lat}, ${lng}]`);
    }

    // Update address display below map
    const addressDisplay = document.getElementById("mapAddressDisplay");
    if (addressDisplay) {
      addressDisplay.innerHTML = `
        <div style="text-align: center; padding: 10px; line-height: 1.6;">
          <i class="fa-solid fa-location-dot" style="color:var(--gold); margin-right: 8px;"></i>
          <span>${escHtml(label)}</span><br>
          <small style="color: var(--muted); font-family: monospace;">
            ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </small>
        </div>
      `;
    }

    // Trigger map resize
    setTimeout(() => {
      if (leafletMap) {
        leafletMap.invalidateSize();
        console.log("✓ Map resized");
      }
    }, 200);
    
  } catch (error) {
    console.error("Map initialization error:", error);
    showToast("Could not display map.", "error");
  }
}


/**
 * Validate coordinates from geolocation API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are valid
 */
function validateCoordinates(lat, lon) {
  // Check type and range
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    console.error("Invalid coordinate types:", { lat, lon });
    return false;
  }
  
  if (isNaN(lat) || isNaN(lon)) {
    console.error("Coordinates are NaN:", { lat, lon });
    return false;
  }
  
  if (lat < -90 || lat > 90) {
    console.error("Latitude out of range:", lat);
    return false;
  }
  
  if (lon < -180 || lon > 180) {
    console.error("Longitude out of range:", lon);
    return false;
  }
  
  // Reject 0,0 without additional context (unlikely to be real)
  if (lat === 0 && lon === 0) {
    console.error("Suspicious 0,0 coordinates rejected");
    return false;
  }
  
  console.log(`✓ Coordinates validated: [${lat}, ${lon}]`);
  return true;
}

/**
 * Reverse geocode coordinates to full address using OpenStreetMap Nominatim
 * ONLY returns actual address data, never fallback or guessed locations
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Address object with full address or null
 */
async function reverseGeocodeToAddress(lat, lon) {
  // Validate coordinates first
  if (!validateCoordinates(lat, lon)) {
    console.error("Cannot reverse geocode invalid coordinates");
    return null;
  }

  try {
    // Use jsonv2 format for more detailed address information
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    console.log(`Fetching reverse geocoding: ${url}`);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`Nominatim API error: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    console.log("Nominatim response:", data);
    
    if (!data || !data.address) {
      console.warn("No address data in Nominatim response");
      return null;
    }
    
    const addr = data.address;
    
    // Build address from actual address components (NO FALLBACK TO DEFAULTS)
    const addressParts = [];
    
    // Road/Street (most specific)
    if (addr.road) addressParts.push(addr.road);
    else if (addr.house_number) addressParts.push(addr.house_number);
    
    // City/Town level
    const cityName = addr.city || addr.town || addr.village || addr.suburb;
    if (cityName) addressParts.push(cityName);
    
    // State/Region
    if (addr.state) addressParts.push(addr.state);
    
    // Country (required)
    if (!addr.country) {
      console.warn("No country in address data");
      return null;
    }
    
    addressParts.push(addr.country);
    
    const fullAddress = addressParts.join(", ");
    
    if (!fullAddress || fullAddress.trim().length === 0) {
      console.warn("Could not build meaningful address");
      return null;
    }
    
    return {
      display: fullAddress,
      components: addr,
      lat: lat,
      lon: lon,
      displayName: data.display_name || fullAddress
    };
    
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

function openAddressOnOpenStreetMap() {
  const address = val("address");
  if (!address) {
    showToast("Enter your address first.", "warning");
    return;
  }
  // Opens OpenStreetMap with readable address only (no coordinates)
  window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`, "_blank");
}

/**
 * Show location detection UI for retrying
 */
function showLocationRetryUI() {
  const retryBtn = document.getElementById("retryLocationButton");
  if (retryBtn) {
    retryBtn.style.display = "inline-block";
  }
}

/**
 * Hide location detection retry UI
 */
function hideLocationRetryUI() {
  const retryBtn = document.getElementById("retryLocationButton");
  if (retryBtn) {
    retryBtn.style.display = "none";
  }
}

/**
 * Detect user's actual GPS location with high accuracy
 * ONLY fills address if real coordinates are obtained
 * Shows errors instead of guessing
 */
async function detectLocation() {
  // Secure context check
  if (!window.isSecureContext && !window.location.hostname.includes("localhost")) {
    showToast("Location detection requires HTTPS connection or localhost environment.", "error");
    console.warn("Insecure context: HTTPS or localhost required");
    return;
  }

  // Browser support check
  if (!navigator.geolocation) {
    showToast("Your browser does not support the Geolocation API. Please update it.", "error");
    console.error("Geolocation API not available");
    return;
  }

  showToast("Detecting your location... This may take a moment.", "info");
  hideLocationRetryUI();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const altitudeAccuracy = position.coords.altitudeAccuracy;
        
        // Log raw position data for debugging
        console.log("=== RAW GEOLOCATION DATA ===");
        console.log(`Latitude: ${lat}`);
        console.log(`Longitude: ${lon}`);
        console.log(`Accuracy (meters): ${accuracy}`);
        console.log(`Altitude Accuracy: ${altitudeAccuracy}`);
        console.log("============================");
        
        // Validate coordinates
        if (!validateCoordinates(lat, lon)) {
          showToast("Invalid coordinates received. Please try again.", "error");
          showLocationRetryUI();
          return;
        }
        
        // Check accuracy - reject if too poor
        const ACCURACY_THRESHOLD = 1000; // meters
        if (accuracy > ACCURACY_THRESHOLD) {
          console.warn(`Low accuracy detected: ${accuracy}m (threshold: ${ACCURACY_THRESHOLD}m)`);
          showToast(
            `Low accuracy location detected (${Math.round(accuracy)}m accuracy). ` +
            `Please ensure Location Services are enabled and you have clear sky view. Try again or enter manually.`,
            "warning"
          );
          showLocationRetryUI();
          return;
        }
        
        // All checks passed - proceed with reverse geocoding
        console.log("✓ Coordinates validated and accuracy acceptable");
        showToast("Converting coordinates to address...", "info");
        
        const addressData = await reverseGeocodeToAddress(lat, lon);
        
        if (!addressData) {
          console.error("Reverse geocoding returned null or invalid data");
          showToast(
            "Could not convert coordinates to address. The location may be in an unmapped region. " +
            "Please enter your address manually.",
            "warning"
          );
          showLocationRetryUI();
          return;
        }
        
        // Update address field ONLY if valid address obtained
        const addressField = document.getElementById("address");
        if (!addressField) {
          console.error("Address field not found in DOM");
          return;
        }
        
        addressField.value = addressData.display;
        updatePreview();
        
        // Update map with REAL coordinates
        initLeafletMap(lat, lon, addressData.displayName);
        
        // Show success with accuracy info
        const accuracyInfo = accuracy < 50 
          ? "Very accurate" 
          : accuracy < 100 
          ? "Accurate" 
          : `${Math.round(accuracy)}m accuracy`;
        
        showToast(
          `✓ Location detected successfully! (${accuracyInfo})`,
          "success"
        );
        
        hideLocationRetryUI();
        
      } catch (error) {
        console.error("Error processing geolocation data:", error);
        showToast(
          "An error occurred while processing your location. Please try again or enter manually.",
          "error"
        );
        showLocationRetryUI();
      }
    },
    (error) => {
      // Handle geolocation errors separately
      let errorMsg = "Location detection failed.";
      let shouldShowRetry = true;
      
      if (error && error.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMsg = "Permission denied. Please enable location access in your browser settings and try again.";
            shouldShowRetry = true;
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMsg = "Location information is not available. Please check your internet connection and try again.";
            shouldShowRetry = true;
            break;
          case 3: // TIMEOUT
            errorMsg = "Location detection timed out. Please ensure GPS is enabled and try again.";
            shouldShowRetry = true;
            break;
          default:
            errorMsg = `Location error (code ${error.code}): ${error.message || "Unknown error"}`;
        }
      }
      
      console.error("Geolocation API error:", error);
      showToast(errorMsg, "error");
      
      if (shouldShowRetry) {
        showLocationRetryUI();
      }
    },
    {
      enableHighAccuracy: true,  // REQUEST HIGH ACCURACY GPS
      timeout: 15000,             // 15 second timeout for GPS acquisition
      maximumAge: 0               // NO CACHING - always get fresh coordinates
    }
  );
}



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

function printCV() {
  window.print();
}

function saveData() {
  const data = {
    fullName: val("fullName"),
    profTitle: val("profTitle"),
    email: val("email"),
    phone: val("phone"),
    address: val("address"), // PRIVACY: Only address text stored, never coordinates
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
  showToast("Data saved successfully! Use Ctrl+S to save faster.");
}

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
    
  } catch (e) {
    console.error("Error loading saved data:", e);
    localStorage.removeItem("cvforge_data");
  }
}

function clearAll() {
  if (!confirm("Clear all data?")) return;

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
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("cvforge_theme");
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("themeIcon").className = "fa-solid fa-moon";
    state.theme = "light";
  }

  // Load saved data first
  loadSavedData();
  updatePreview();

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveData();
    }
  });
});
