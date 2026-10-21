/* =========================================================
   SCRIPT.JS
   1. VIDEOS  ← add or edit your videos here
   2. Helpers  3. Video cards + pop-up  4. Tabs
   5. Animated numbers  6. Menu, theme, active link  7. Small extras
   ========================================================= */

/* ---------- 1. VIDEOS ----------
   How to add a video:
   - platform: "youtube" or "instagram"
   - title:    any title you like
   - url:      the full link of the video (copy it from YouTube / Instagram)
   YouTube thumbnails load automatically from the link.
   For Instagram, you can add a screenshot: thumb: "assets/reel1.jpg"
   The three below are examples. Replace them with your own links. */
const VIDEOS = [
  { platform: "youtube",   title: "Example: Your best YouTube video",  url: "https://www.youtube.com/watch?v=8pjgSqgLjtc&t=354s" },
  { platform: "youtube",   title: "Example: Your best YouTube video",  url: "https://youtu.be/Ntc6Jtgg7kk" },
  { platform: "youtube",   title: "Example: Your best YouTube video",  url: "https://youtu.be/jg-xn077PlI" },
  { platform: "youtube",   title: "Example: A board exam guidance video", url: "https://www.youtube.com/watch?v=oODlcoRrSP4" },
  { platform: "instagram", title: "Example: Your best Instagram reel", url: "https://www.instagram.com/seekh_kar_sikhate_raho/", thumb: "" }
];

/* ---------- 2. HELPERS ---------- */
const $  = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Gets the video ID out of a YouTube link (watch, youtu.be, shorts)
function getYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- 3. VIDEO CARDS + POP-UP ---------- */
const grid = $("#videoGrid");

function renderVideos(filter = "all") {
  grid.innerHTML = "";
  const shown = VIDEOS.filter((v) => filter === "all" || v.platform === filter);

  shown.forEach((video) => {
    const id = getYouTubeId(video.url);
    // Use the YouTube thumbnail, or your own image for Instagram
    const thumbSrc = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : video.thumb;

    const card = document.createElement("button");
    card.className = "video";
    card.innerHTML = `
      <div class="thumb">
        ${thumbSrc ? `<img src="${thumbSrc}" alt="" loading="lazy" onerror="this.remove()">` : ""}
        <span class="play"></span>
      </div>
      <div class="info">
        <h3>${video.title}</h3>
        <span class="source">${video.platform === "youtube" ? "YouTube" : "Instagram"}</span>
      </div>`;
    card.addEventListener("click", () => openVideo(video));
    grid.appendChild(card);
  });

  if (shown.length === 0) grid.innerHTML = "<p class='muted'>No videos here yet.</p>";
}

// Opens a pop-up. YouTube plays inside it; Instagram opens in a new tab.
function openVideo(video) {
  const id = getYouTubeId(video.url);
  const body = $("#modalBody");

  // YouTube blocks embedded players on pages opened straight from your computer
  // (address starts with file://). In that case, open YouTube in a new tab instead.
  // Once the site is uploaded online, the pop-up player works normally.
  if (id && location.protocol === "file:") {
    window.open(video.url, "_blank", "noopener");
    return;
  }

  if (id) {
    body.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1"
      title="${video.title}" referrerpolicy="strict-origin-when-cross-origin"
      allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
  } else {
    const name = video.platform === "youtube" ? "YouTube" : "Instagram";
    body.innerHTML = `<div><p>This video opens on ${name}.</p>
      <a class="btn primary" href="${video.url}" target="_blank" rel="noopener">Watch on ${name}</a></div>`;
  }
  $("#modal").hidden = false;
}

function closeVideo() {
  $("#modal").hidden = true;
  $("#modalBody").innerHTML = ""; // stops the video
}

$("#modalClose").addEventListener("click", closeVideo);
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeVideo(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeVideo(); });

// Filter buttons: All / YouTube / Instagram
$$(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".filter").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    renderVideos(button.dataset.filter);
  });
});

/* ---------- 4. TABS (Experience / Education / Content) ---------- */
$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => t.classList.remove("active"));
    $$(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    $("#" + tab.dataset.tab).classList.add("active");
  });
});

/* ---------- 5. ANIMATED NUMBERS ---------- */
function animateCount(el) {
  const target   = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const suffix   = el.dataset.suffix || "";
  const duration = 1400; // milliseconds
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // slows down at the end
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Start counting when the numbers scroll into view
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
$$(".count").forEach((el) => counterObserver.observe(el));

/* ---------- 6. MENU, THEME, ACTIVE LINK ---------- */
// Mobile menu
const menu = $("#menu");
$("#menuToggle").addEventListener("click", (e) => {
  const open = menu.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", () => menu.classList.remove("open"));

// Light / dark theme (remembers your choice)
const root = document.documentElement;
function setTheme(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem("theme", theme); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("#themeToggle").addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

// Highlight the menu link of the section you are viewing
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      $$(".menu a").forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((section) => sectionObserver.observe(section));

/* ---------- 7. SMALL EXTRAS ---------- */
// Copy email button
$("#copyEmail").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("barkha22dec@gmail.com");
    showToast("Email copied");
  } catch (e) {
    showToast("barkha22dec@gmail.com");
  }
});

$("#year").textContent = new Date().getFullYear();

// Start
renderVideos();
