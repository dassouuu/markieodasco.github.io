/* Configuration reader. Edit portfolio.ini, not this file. */
(() => {
  "use strict";
  function parse(text) {
    const sections = [], seen = new Set();
    let current;
    const error = (line, message) => { throw new Error(`portfolio.ini line ${line}: ${message}`); };
    String(text).replace(/^\uFEFF/, "").split(/\r?\n/).forEach((raw, index) => {
      const line = raw.trim();
      if (!line || line.startsWith("#") || line.startsWith(";")) return;
      if (line.startsWith("[")) {
        const match = /^\[(profile|project:([a-z0-9]+(?:-[a-z0-9]+)*))\]$/.exec(line);
        if (!match) error(index + 1, "Use [profile] or [project:your-project-name]. Use lowercase letters, numbers, and hyphens for project IDs.");
        if (seen.has(match[1])) error(index + 1, `Duplicate section [${match[1]}]. Give each project a different ID.`);
        seen.add(match[1]);
        current = { type: match[1] === "profile" ? "profile" : "project", id: match[2], line: index + 1, values: Object.create(null) };
        sections.push(current); return;
      }
      if (!current) error(index + 1, "Add [profile] or a [project:...] heading above these settings.");
      const equals = line.indexOf("=");
      if (equals < 1) error(index + 1, "Use setting=value. Keep descriptions on one line.");
      const key = line.slice(0, equals).trim();
      const allowed = current.type === "profile" ? ["name", "email", "whatsapp", "discord", "about", "skills", "tools", "tools-note"] : ["title", "category", "description", "video", "thumbnail", "placeholder", "tags", "enabled"];
      if (!allowed.includes(key)) error(index + 1, `Unknown setting '${key}'. Allowed settings: ${allowed.join(", ")}.`);
      if (Object.hasOwn(current.values, key)) error(index + 1, `Duplicate setting '${key}' in this section.`);
      current.values[key] = line.slice(equals + 1).trim();
    });
    const profile = sections.find(s => s.type === "profile");
    if (!profile) error(1, "The [profile] section is missing.");
    const list = value => (value || "").split("|").map(v => v.trim()).filter(Boolean);
    const flag = (value, fallback, section, key) => {
      if (!value) return fallback;
      if (!/^(yes|no)$/i.test(value)) error(section.line, `${key} must be yes or no in [project:${section.id}].`);
      return value.toLowerCase() === "yes";
    };
    const media = (filename, folder, extensions, section) => {
      if (!filename) return "";
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(filename) || filename.includes("..") || !extensions.test(filename)) error(section.line, `Invalid filename '${filename}'. Enter only a filename such as ${section.id}${folder === "videos" ? ".mp4" : ".jpg"}, without folders or spaces.`);
      const path = `assets/${folder}/${filename}`;
      return window.PORTFOLIO_ASSETS?.[path] || path;
    };
    const projects = sections.filter(s => s.type === "project").flatMap(section => {
      const v = section.values;
      if (!flag(v.enabled, true, section, "enabled")) return [];
      if (!v.title) error(section.line, `Add title=Your project title to [project:${section.id}].`);
      const labels = { ugc: "AI UGC AD", product: "PRODUCT AD", animation: "AI ANIMATION" };
      if (!Object.hasOwn(labels, v.category || "")) error(section.line, "category must be ugc, product, or animation.");
      const placeholder = flag(v.placeholder, false, section, "placeholder");
      const video = media(v.video || (placeholder ? "" : `${section.id}.mp4`), "videos", /\.mp4$/i, section);
      const poster = media(v.thumbnail || `${section.id}.jpg`, "thumbnails", /\.(jpg|jpeg|png|webp|gif|svg)$/i, section);
      return [{ id: section.id, title: v.title, category: v.category, label: labels[v.category], description: v.description || "", poster, video, placeholder, tags: list(v.tags) }];
    });
    const p = profile.values;
    return { name: p.name || "YOUR NAME", email: p.email || "", whatsapp: p.whatsapp || "", discord: p.discord || "", about: p.about || "AI video specialist creating AI UGC ads, product ads, and AI-generated video creatives.", skills: list(p.skills), tools: list(p.tools), toolsNote: p["tools-note"] || "", projects };
  }
  window.PortfolioConfig = { parse };
  window.PORTFOLIO_READY = (async () => {
    try {
      let text = window.PORTFOLIO_TEXT;
      // Published index.html reads portfolio.ini directly; local files use the snapshot.
      if (!window.PORTFOLIO_EMBEDDED && ["http:", "https:"].includes(location.protocol)) {
        const response = await fetch("portfolio.ini", { cache: "no-store" });
        if (!response.ok) throw new Error("portfolio.ini could not load. Upload it next to index.html.");
        text = await response.text();
      }
      if (typeof text !== "string") throw new Error("Configuration snapshot missing. Double-click UPDATE-PORTFOLIO.cmd to refresh it.");
      window.PORTFOLIO = parse(text);
    } catch (error) { window.PORTFOLIO_CONFIG_ERROR = error.message; }
  })();
})();
