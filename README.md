# ⚡ Event Inspector

> A Chrome extension that captures and displays all events fired on any web page in real-time.

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8.0-purple?style=flat-square&logo=vite" alt="Vite">
</p>

---

## ✨ Features

- **Real-time capture** — See every event as it fires, no more `console.log` hunting
- **Native + Custom** — Captures both DOM events (click, input, submit, focus, etc.) and `CustomEvent` dispatches
- **Target info** — Shows exactly which element triggered the event (CSS selector)
- **Shadow DOM** — Panel is isolated from page styles — no conflicts
- **Click to scroll** — Click any event in the list to jump to its target in the page
- **Pause/Resume** — Toggle capture on/off without losing events

---

## 📸 Demo

```
┌─────────────────────────────────────────────┐
│  ⚡ Event Inspector              [pause] ✕  │
├─────────────────────────────────────────────┤
│  [native] click     #submit-btn    14:32:01 │
│  [custom]  my-data  .card          14:32:00 │
│  [native] input     #search        14:31:58 │
│  [native] focus     input.email    14:31:55 │
│  [custom] api-load  body           14:31:50 │
│  ...                                      │
└─────────────────────────────────────────────┘
```

---

## 🚀 Installation

### From Source

```bash
# Clone and install
git clone https://github.com/yourusername/event-inspector.git
cd event-inspector
pnpm install

# Build
pnpm build
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

---

## 🔧 Usage

1. Install the extension in Chrome
2. Open any web page
3. Click the extension icon in the toolbar
4. Interact with the page — events appear in real-time!

### Controls

| Button             | Action                            |
| ------------------ | --------------------------------- |
| `Pause` / `Resume` | Toggle event capture              |
| `Clear`            | Remove all captured events        |
| `×` (minimize)     | Collapse to show event count only |

---

## 📁 Project Structure

```
event-inspector/
├── manifest.json      # Extension manifest (v3)
├── src/
│   ├── main.ts      # Entry point
│   └── ...
├── dist/           # Build output
└── package.json
```

---

## 🛠️ Tech Stack

- **Build**: Vite 8.0
- **Language**: TypeScript 6.0
- **Platform**: Chrome Extension (Manifest v3)

---

## 📝 License

MIT — feel free to use, modify, and distribute.

---

## 🤝 Contributing

PRs welcome! If you find a bug or have a feature request, open an issue.
