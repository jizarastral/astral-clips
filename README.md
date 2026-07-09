# Astral Clips

Public landing page for the Astral Clips short-form video service (UAE).

## Live URLs

| Host | URL |
|------|-----|
| **Render (primary)** | https://astral-clips.onrender.com |
| Waitlist form | https://astral-clips.onrender.com/#waitlist |
| GitHub Pages (backup) | https://jizarastral.github.io/astral-clips/ |

**WhatsApp:** https://wa.me/971505804276  
**Email:** astralfconsulting@gmail.com  
**Parent brand:** https://astralforgeweb.onrender.com  

### Public waitlist (saves to your Gmail)

The SaaS waitlist form posts to **FormSubmit** → **astralfconsulting@gmail.com**.

1. First signup ever: FormSubmit sends **one confirmation email** — open it and click confirm.  
2. After that, every waitlist join lands in your Gmail inbox (subject: `Astral Clips — SaaS waitlist signup`).  
3. Check Gmail / search `Astral Clips — SaaS waitlist`.  

Local `saas/` waitlist on your PC is optional for testing only.

## Deploy to Render

### Option A — Static Site (recommended)

1. [dashboard.render.com](https://dashboard.render.com) → **New → Static Site**
2. Connect repo **`jizarastral/astral-clips`**
3. Settings:
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** `.`
4. Create → URL will be like `https://astral-clips.onrender.com`
5. Enable **Auto-Deploy** on `main`

### Option B — Blueprint

1. **New → Blueprint**
2. Select this repo (uses `render.yaml`)

## Local preview

```bash
npx --yes serve . -l 8765
```

Open http://127.0.0.1:8765

## Files

```
index.html      # main landing
styles.css
app.js          # loads config.json (WhatsApp + prices)
config.json     # edit WhatsApp / packages here
all-in-one.html # single-file backup page
render.yaml     # Render blueprint
```

## Related tools (PC)

Clip automation / GUI live under `C:\Users\jizar\clip-service\` (not deployed to Render — local only).
