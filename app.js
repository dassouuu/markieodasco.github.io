(async () => {
  "use strict";
  window.PORTFOLIO_APP_LOADED = true;
  if (window.PORTFOLIO_READY) await window.PORTFOLIO_READY;
  const config = window.PORTFOLIO;
  if (!config) {
    const note = document.createElement("div");
    note.setAttribute("role", "alert");
    note.style.cssText = "background:#fff3ce;color:#241d0b;padding:24px;margin:20px;border:2px solid #956b13;font:15px/1.6 Arial,sans-serif";
    note.textContent = (window.PORTFOLIO_CONFIG_ERROR || "The project configuration could not load.") + " Edit portfolio.ini, save, then double-click UPDATE-PORTFOLIO.cmd and reopen this page.";
    document.body.prepend(note);
    return;
  }
  const $ = (s) => document.querySelector(s);
  const make = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };
  const safeMedia = (value) => {
    if (!value) return "";
    // The one-file preview embeds local artwork as base64 image data URLs.
    if (/^data:image\/(?:svg\+xml|png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
    try { const url = new URL(value, location.href); return ["http:", "https:", "file:"].includes(url.protocol) ? value : ""; } catch { return ""; }
  };
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email || "") ? config.email : "";
  document.querySelectorAll("[data-name]").forEach(el => el.textContent = config.name);
  document.title = `${config.name} — AI Video Specialist`;
  $("#about-text").textContent = config.about;
  $("#year").textContent = new Date().getFullYear();
  for (const skill of config.skills) $("#skills").append(make("span", "", skill));
  for (const tool of config.tools) $("#tools").append(make("span", "", tool));
  $("#tools-note").textContent = config.toolsNote || "";
  if (email) {
    const link = $("#email-link"); link.hidden = false; link.textContent = `${email} ↗`; link.href = `mailto:${email}`;
    $("#contact-note").textContent = "Email me directly, or prepare a short brief to include in your message.";
    $("#form-note").textContent = "Prepare your brief, then open it in your email app. Nothing is sent automatically.";
  }
  const whatsapp = (config.whatsapp || "").replace(/[\s+()-]/g, "");
  if (/^[1-9]\d{7,14}$/.test(whatsapp)) {
    const link = $("#whatsapp-link"); link.hidden = false;
    link.href = `https://wa.me/${whatsapp}`;
    link.target = "_blank"; link.rel = "noopener noreferrer";
    link.textContent = `WhatsApp ${config.whatsapp} ↗`;
  }
  if (config.discord) {
    $("#discord-contact").hidden = false;
    $("#discord-handle").value = config.discord;
    $("#copy-discord").addEventListener("click", async () => {
      try {
        if (!navigator.clipboard) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(config.discord);
        $("#discord-status").textContent = "Discord username copied.";
      } catch {
        $("#discord-handle").focus(); $("#discord-handle").select();
        $("#discord-status").textContent = "Username selected. Press Ctrl+C or Command+C to copy.";
      }
    });
  }
  const menu = $(".menu-toggle");
  const closeMenu = () => { menu.setAttribute("aria-expanded", "false"); $("#navigation").classList.remove("open"); };
  menu.addEventListener("click", () => { const open = menu.getAttribute("aria-expanded") !== "true"; menu.setAttribute("aria-expanded", String(open)); $("#navigation").classList.toggle("open", open); });
  $("#navigation").addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  document.addEventListener("click", e => { if (!e.target.closest(".site-header")) closeMenu(); });
  const dialog = $("#project-dialog");
  let previousFocus;
  const openProject = (project, trigger) => {
    previousFocus = trigger;
    const media = $("#dialog-media"); media.replaceChildren();
    const videoPath = safeMedia(project.video);
    if (videoPath) {
      const video = make("video"); video.controls = true; video.playsInline = true; video.preload = "metadata"; video.src = videoPath; video.poster = safeMedia(project.poster); video.setAttribute("aria-label", project.title);
      video.addEventListener("error", () => { $("#dialog-status").textContent = "This video could not load. Please check its file path or try again later."; });
      media.append(video);
    } else { const img = make("img"); img.src = safeMedia(project.poster); img.alt = `Illustrated concept for ${project.title}`; media.append(img); }
    $("#dialog-category").textContent = project.label;
    $("#dialog-title").textContent = project.title;
    $("#dialog-description").textContent = project.description;
    $("#dialog-tags").replaceChildren(...project.tags.map(t => make("span", "", t)));
    $("#dialog-status").textContent = project.placeholder ? "PLACEHOLDER CONCEPT — Original illustrated direction. No finished video or client association is represented." : (videoPath ? "Use the player controls to watch this project." : "Project overview. Video has not been added yet.");
    dialog.showModal(); document.body.classList.add("modal-open"); $(".dialog-close").focus();
  };
  const closeDialog = () => { const video = dialog.querySelector("video"); if (video) video.pause(); dialog.close(); };
  $(".dialog-close").addEventListener("click", closeDialog);
  dialog.addEventListener("click", e => { if (e.target === dialog) closeDialog(); });
  dialog.addEventListener("close", () => { dialog.querySelector("video")?.pause(); document.body.classList.remove("modal-open"); previousFocus?.focus(); });
  $("#dialog-contact").addEventListener("click", closeDialog);
  const render = (filter = "all") => {
    const projects = config.projects.filter(p => filter === "all" || p.category === filter);
    $("#project-grid").replaceChildren();
    projects.forEach((project, i) => {
      const card = make("article", "project-card");
      const button = make("button", "project-poster"); button.type = "button"; button.setAttribute("aria-label", `${project.video ? "Watch" : "View concept"}: ${project.title}`);
      const img = make("img"); img.src = safeMedia(project.poster); img.alt = `Thumbnail for ${project.title}`; img.loading = "lazy"; img.width = 800; img.height = 650;
      img.addEventListener("error", () => { img.hidden = true; button.classList.add("missing-poster"); });
      button.append(img, make("span", "project-badge", project.placeholder ? "CONCEPT PREVIEW" : "VIDEO PROJECT"), make("span", "play-icon", project.video ? "▶" : "↗"), make("span", "poster-cta", project.video ? "Watch project" : "Explore concept"));
      button.addEventListener("click", () => openProject(project, button));
      const meta = make("div", "project-meta"); meta.append(make("span", "", project.label), make("span", "", String(i + 1).padStart(2, "0")));
      const title = make("h3", "", project.title);
      const description = make("p", "project-summary", project.description);
      card.append(button, meta, title, description); $("#project-grid").append(card);
    });
    if (!projects.length) $("#project-grid").append(make("p", "portfolio-note", "No projects in this category yet."));
    $("#project-count").textContent = `${projects.length} projects displayed`;
  };
  render();
  $(".filter[data-filter='all'] span").textContent = String(config.projects.length).padStart(2, "0");
  $(".concept-note").textContent = config.projects.every(p => p.placeholder) ? "PLACEHOLDER CONCEPTS" : "CREATIVE PORTFOLIO";
  if (!config.projects.every(p => p.placeholder)) $(".work-section > .portfolio-note").textContent = "Selected video creatives. Descriptions highlight creative format and editing approach; no client affiliation or performance results are claimed.";
  document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".filter").forEach(b => { b.classList.toggle("active", b === button); b.setAttribute("aria-pressed", String(b === button)); }); render(button.dataset.filter); }));
  let brief = "";
  $("#brief-form").addEventListener("submit", event => {
    event.preventDefault(); const values = new FormData(event.currentTarget);
    brief = `PROJECT INQUIRY\n\nName: ${String(values.get("name")).trim()}\nEmail: ${String(values.get("email")).trim()}\nCreative type: ${values.get("type")}\n\nProject details:\n${String(values.get("details")).trim()}\n`;
    $("#brief-output").value = brief; $("#brief-result").hidden = false;
    $("#form-status").textContent = "Your brief is ready. Copy or download it; no message has been sent.";
    if (email) { const send = $("#send-brief"); send.hidden = false; send.href = `mailto:${email}?subject=${encodeURIComponent("Video project inquiry: " + values.get("type"))}&body=${encodeURIComponent(brief)}`; }
    $("#brief-output").focus();
  });
  $("#copy-brief").addEventListener("click", async () => {
    try { if (!navigator.clipboard) throw new Error("Clipboard unavailable"); await navigator.clipboard.writeText(brief); $("#form-status").textContent = "Brief copied. Paste it into your message."; }
    catch { $("#brief-output").focus(); $("#brief-output").select(); $("#form-status").textContent = "Brief selected. Press Ctrl+C or Command+C to copy, or use Download .txt."; }
  });
  $("#download-brief").addEventListener("click", () => { const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" })); const link = make("a"); link.href = url; link.download = "video-project-brief.txt"; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); $("#form-status").textContent = "Brief downloaded. No message has been sent."; });
  // Keep content visible without JS or IntersectionObserver; animate only as enhancement.
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("in-view"); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    document.querySelectorAll(".section-heading, .service-list article, .workflow-grid article, .about-copy").forEach(el => { el.classList.add("reveal"); observer.observe(el); });
  }
})();
