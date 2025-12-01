---

# NullSector — Cybersecurity Learning Hub

Welcome — this is the official NullSector learning site I built to teach cybersecurity fundamentals and help new learners practice safely.

Live demo: (deployed on Vercel) — add link once deployed.
Live demo: https://nullsector.vercel.app (update with real URL after deploy)

![NullSector Logo](logo.svg)

## Quick Showcase

- Built with plain HTML, CSS and JavaScript — no frameworks required.
- Polished, dark-themed UI with animations and an accessible layout.
- Interactive elements: clickable roadmap, FAQ with live search (Ctrl+K), and a safe simulated terminal to practice commands.
- Fully responsive and designed for performance.

## Files & Structure

```
nullnode/
├── index.html
├── roadmap.html
├── faq.html
├── learn/
│   ├── 01-fundamentals.html
│   └── 02-10 placeholders
├── styles.css
├── script.js
├── terminal.js
├── logo.svg
├── vercel.json
└── README.md
```

## Preview locally

```powershell
cd C:\Users\geeth\Documents\nullnode
python -m http.server 8000
```

Open `http://localhost:8000` in a browser. If something looks stale, use Ctrl+Shift+R to force reload.

## Deploy to Vercel — quick steps

1. Create a Vercel account (https://vercel.com) if you don’t already have one.
2. Import this repository from GitHub.
3. Choose “Other” as the framework preset.
4. Keep the Output Directory blank or `/` and deploy.

Tip: You can also use the CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Showcase Features (what to highlight on the main page)

- Terminal simulator — lesson-safe command practice with `help`, `ls`, `pwd`, `cat welcome.txt`, `ping`, `nmap`, and examples.
- Roadmap — 10 clickable stages from fundamentals to certifications.
- Learning structure — comprehensive `01-fundamentals.html` (OS, networking, programming, CLI, hardware)
- Visual polish — starfield background, gradients, subtle animations, and the NullSector brand.

## Want to add a screenshot or demo?

Drop a screenshot into the repo i.e., `assets/screenshot.png`, and add a Markdown image link near the top of this README.

## Contribution & Ownership notes

- This project is managed by NullSector; contributions are welcome for content and UI improvements.
- Use the GitHub PR flow. Keep PRs focused, include screenshots for UI changes, and keep the site’s performance in mind.
- If you want me to add or maintain content, I can handle it for you.

## Scripts — Force-push helper (use with care)

I added `scripts/force-push.ps1` to help run a safe forced push to the remote repository. Use this only if you know what you’re doing — it may overwrite history.

To run (PowerShell):
```powershell
cd C:\Users\geeth\Documents\nullnode
.\scripts\force-push.ps1 -AddRemoteIfMissing -RemoteUrl 'https://github.com/Daiwik-M-Jith/nullnode.git'
```

Options:
- `-AddRemoteIfMissing` — add `origin` if none exists
- `-ForcePush` — use unconditional `--force` instead of `--force-with-lease`
- `-DryRun` — show planned operations, do not execute

You’ll be prompted to confirm before any operation runs.

## Contact & Links

- Discord: https://discord.gg/Tz9Y3wea32
- GitHub: https://github.com/Daiwik-M-Jith

## License

MIT — You own and can redistribute this work.

---

If you want, I can add a Vercel badge, a “Live demo” link, or embed the current screenshot in the README. Tell me which badge or details you prefer and I’ll add them.

— NullSector
---

If you’d like, I can also add CI previews for pull requests, a custom domain, or a GitHub Action to run link-checking before deploying.

— Built with ❤️ by me (you)
