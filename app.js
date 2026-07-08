/* Astral Clips — landing page logic. Edit WhatsApp in config.json, then refresh. */

const FALLBACK = {
  whatsapp: "971505804276",
  packages: [
    { id: "spark", name: "Spark", clips: 5, price: 99, delivery_hours: 24, includes: ["9:16 vertical", "hook cut", "basic captions", "1 revision"] },
    { id: "boost", name: "Boost", clips: 12, price: 199, delivery_hours: 24, popular: true, includes: ["9:16 vertical", "hook + punch-in cuts", "captions", "emoji/stickers", "2 revisions", "posting tips"] },
    { id: "dominate", name: "Dominate", clips: 25, price: 349, delivery_hours: 48, includes: ["everything in Boost", "title cards", "thumbnail stills", "3 platform versions", "3 revisions"] },
    { id: "monthly", name: "Creator Monthly", clips: 60, price: 899, delivery_hours: "ongoing", includes: ["~15 clips/week", "priority queue", "style guide saved", "WhatsApp support", "unlimited minor tweaks"] }
  ]
};

async function loadConfig() {
  try {
    const res = await fetch("config.json", { cache: "no-store" });
    if (!res.ok) throw new Error("no config");
    return await res.json();
  } catch {
    return FALLBACK;
  }
}

function waLink(number, text) {
  const n = String(number).replace(/\D/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

function renderPricing(cfg) {
  const root = document.getElementById("pricing-cards");
  const select = document.getElementById("package-select");
  root.innerHTML = "";
  select.innerHTML = "";

  cfg.packages.forEach((p) => {
    const card = document.createElement("article");
    card.className = "price-card" + (p.popular ? " popular" : "");
    card.innerHTML = `
      ${p.popular ? '<span class="pill">Most popular</span>' : ""}
      <h3>${p.name}</h3>
      <div class="amount">${p.price} <span>AED</span></div>
      <div class="clips">${p.clips} clips · ${p.delivery_hours === "ongoing" ? "monthly" : p.delivery_hours + "h"}</div>
      <ul>${(p.includes || []).map((i) => `<li>${i}</li>`).join("")}</ul>
      <a class="btn btn--primary" href="${waLink(cfg.whatsapp, defaultMsg(p))}">Order ${p.name}</a>
    `;
    root.appendChild(card);

    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} — ${p.clips} clips — ${p.price} AED`;
    select.appendChild(opt);
  });
}

function defaultMsg(p) {
  return `Hi Astral Clips! I want the *${p.name}* package (${p.clips} clips / ${p.price} AED). I'll send my video link next.`;
}

function wireForm(cfg) {
  const hero = document.getElementById("wa-hero");
  hero.href = waLink(
    cfg.whatsapp,
    "Hi Astral Clips! I want short-form clips from my long video. What's the next step?"
  );

  document.getElementById("order-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const pkg = cfg.packages.find((p) => p.id === fd.get("package")) || cfg.packages[1];
    const text = [
      `Hi Astral Clips! New order 🎬`,
      ``,
      `Name: ${fd.get("name")}`,
      `Package: ${pkg.name} (${pkg.clips} clips / ${pkg.price} AED)`,
      `Video: ${fd.get("link")}`,
      `Notes: ${fd.get("notes") || "—"}`,
      ``,
      `Please confirm turnaround + payment details.`
    ].join("\n");
    window.open(waLink(cfg.whatsapp, text), "_blank");
  });
}

loadConfig().then((cfg) => {
  renderPricing(cfg);
  wireForm(cfg);
});
