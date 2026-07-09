/* Astral Clips — leads route:
 * Primary Sales WA: +971 55 445 8850
 * Analysis copy WA: +971 50 580 4276
 * Email: astralfconsulting@gmail.com
 */

const FALLBACK = {
  whatsapp: "971554458850",
  email: "astralfconsulting@gmail.com",
  packages: [
    { id: "spark", name: "Spark", clips: 5, price: 99, delivery_hours: 24, includes: ["9:16 vertical", "hook cut", "basic captions", "1 revision"] },
    { id: "boost", name: "Boost", clips: 12, price: 199, delivery_hours: 24, popular: true, includes: ["9:16 vertical", "hook + punch-in cuts", "captions", "emoji/stickers", "2 revisions", "posting tips"] },
    { id: "dominate", name: "Dominate", clips: 25, price: 349, delivery_hours: 48, includes: ["everything in Boost", "title cards", "thumbnail stills", "3 platform versions", "3 revisions"] },
    { id: "monthly", name: "Creator Monthly", clips: 60, price: 899, delivery_hours: "ongoing", includes: ["~15 clips/week", "priority queue", "style guide saved", "WhatsApp support", "unlimited minor tweaks"] }
  ]
};

const LEAD_EMAIL = "astralfconsulting@gmail.com";
const SALES_WA = "971554458850";
const ANALYSIS_WA = "971505804276";

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

/**
 * Route a lead:
 * 1) Email inbox (FormSubmit)
 * 2) Primary WhatsApp (sales by default)
 * 3) Analysis copy WhatsApp (+971 50 580 4276)
 */
async function deliverLead({ subject, fields, waText, channel = "sales" }) {
  const primary = channel === "support" ? "971508364246" : SALES_WA;
  const channelLabel = channel === "support" ? "SUPPORT" : "SALES";

  const payload = {
    ...fields,
    routed_primary: primary,
    routed_analysis_copy: ANALYSIS_WA,
    channel: channelLabel,
    _subject: subject,
    _template: "table",
    _captcha: "false",
  };

  let emailOk = false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${LEAD_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    emailOk = res.ok;
  } catch (_) {
    emailOk = false;
  }

  // Primary recipient (sales or support)
  window.open(waLink(primary, waText), "_blank", "noopener,noreferrer");

  // Analysis / ops copy — slight delay so both chats can open
  const analysisText =
    `[ANALYSIS COPY · ${channelLabel}]\n` +
    `Primary: +${primary}\n` +
    `—\n` +
    waText;

  setTimeout(() => {
    window.open(waLink(ANALYSIS_WA, analysisText), "_blank", "noopener,noreferrer");
  }, 600);

  return { emailOk };
}

function renderPricing(cfg) {
  const root = document.getElementById("pricing-cards");
  const select = document.getElementById("package-select");
  if (!root || !select) return;
  root.innerHTML = "";
  select.innerHTML = "";
  const wa = cfg.whatsapp || SALES_WA;

  cfg.packages.forEach((p) => {
    const card = document.createElement("article");
    card.className = "price-card" + (p.popular ? " popular" : "");
    card.innerHTML = `
      ${p.popular ? '<span class="pill">Most popular</span>' : ""}
      <h3>${p.name}</h3>
      <div class="amount">${p.price} <span>AED</span></div>
      <div class="clips">${p.clips} clips · ${p.delivery_hours === "ongoing" ? "monthly" : p.delivery_hours + "h"}</div>
      <ul>${(p.includes || []).map((i) => `<li>${i}</li>`).join("")}</ul>
      <a class="btn btn--primary js-wa-sales" href="${waLink(wa, defaultMsg(p))}" data-channel="sales">Order ${p.name}</a>
    `;
    root.appendChild(card);

    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} — ${p.clips} clips — ${p.price} AED`;
    select.appendChild(opt);
  });
}

function defaultMsg(p) {
  return `Hi Astral Clips Sales! I want the *${p.name}* package (${p.clips} clips / ${p.price} AED). I'll send my video link next.`;
}

function wireOrderForm(cfg) {
  const hero = document.getElementById("wa-hero");
  if (hero) {
    hero.href = waLink(
      cfg.whatsapp || SALES_WA,
      "Hi Astral Clips Sales! I want short-form clips from my long video. What's the next step?"
    );
    hero.classList.add("js-wa-sales");
    hero.dataset.channel = "sales";
  }

  const form = document.getElementById("order-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const prev = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending lead…";
    }

    const fd = new FormData(form);
    const pkg = cfg.packages.find((p) => p.id === fd.get("package")) || cfg.packages[1];
    const name = String(fd.get("name") || "").trim();
    const link = String(fd.get("link") || "").trim();
    const notes = String(fd.get("notes") || "").trim();

    const waText = [
      `Hi Astral Clips Sales! New order 🎬`,
      ``,
      `Name: ${name}`,
      `Package: ${pkg.name} (${pkg.clips} clips / ${pkg.price} AED)`,
      `Video: ${link}`,
      `Notes: ${notes || "—"}`,
      ``,
      `Please confirm turnaround + payment.`,
    ].join("\n");

    const { emailOk } = await deliverLead({
      subject: `Astral Clips ORDER — ${pkg.name} — ${name}`,
      fields: {
        type: "clip_order",
        name,
        package: `${pkg.name} (${pkg.clips} / ${pkg.price} AED)`,
        video_link: link,
        notes: notes || "—",
        source: "astral-clips.onrender.com/order",
      },
      waText,
      channel: "sales",
    });

    if (btn) {
      btn.disabled = false;
      btn.textContent = prev;
    }

    if (!emailOk) {
      alert(
        "WhatsApp opened for Sales + analysis copy. Confirm FormSubmit in Gmail once for email alerts."
      );
    }

    form.reset();
  });
}

function wireWaitlistForm() {
  const form = document.querySelector("form.waitlist-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const prev = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Joining…";
    }

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const whatsapp = String(fd.get("whatsapp") || "").trim();
    const plan = String(fd.get("plan") || "").trim();
    const notes = String(fd.get("notes") || "").trim();

    const waText = [
      `New SaaS waitlist lead 📋`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `WhatsApp: ${whatsapp || "—"}`,
      `Plan: ${plan}`,
      `Notes: ${notes || "—"}`,
      `Source: astral-clips waitlist`,
    ].join("\n");

    await deliverLead({
      subject: `Astral Clips — SaaS waitlist — ${name}`,
      fields: {
        type: "saas_waitlist",
        name,
        email,
        whatsapp: whatsapp || "—",
        plan,
        notes: notes || "—",
        source: "astral-clips.onrender.com/waitlist",
      },
      waText,
      channel: "sales",
    });

    if (btn) {
      btn.disabled = false;
      btn.textContent = prev;
    }

    window.location.href = "/thanks.html";
  });
}

/** Direct WA links: open primary + analysis copy when marked */
function wireDualWaLinks() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.js-wa-sales, a.js-wa-support");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href.includes("wa.me")) return;
    e.preventDefault();

    const channel = a.classList.contains("js-wa-support") ? "support" : "sales";
    const primary = channel === "support" ? "971508364246" : SALES_WA;
    const label = channel === "support" ? "SUPPORT" : "SALES";

    // Extract text= from href if present
    let text = "";
    try {
      const u = new URL(href);
      text = u.searchParams.get("text") || "";
    } catch (_) {
      text = "";
    }
    if (!text) {
      text =
        channel === "support"
          ? "Hello AstralForgeAE Technical Support, I need assistance."
          : "Hi Astral Clips Sales! I want to order clips.";
    }

    window.open(waLink(primary, text), "_blank", "noopener,noreferrer");
    setTimeout(() => {
      window.open(
        waLink(
          ANALYSIS_WA,
          `[ANALYSIS COPY · ${label}]\nPrimary: +${primary}\n—\n${text}`
        ),
        "_blank",
        "noopener,noreferrer"
      );
    }, 600);
  });
}

loadConfig().then((cfg) => {
  renderPricing(cfg);
  wireOrderForm(cfg);
  wireWaitlistForm();
  wireDualWaLinks();
});
