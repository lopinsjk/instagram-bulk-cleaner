# 🧹 Instagram Bulk Cleaner

A Chrome extension to automatically remove likes, delete comments, and untag yourself from saved posts on Instagram — in bulk.

> ⚠️ **For personal use only.** This tool automates actions on your own account. Use responsibly and be aware of Instagram's Terms of Service.

---

## ✨ Features

| Feature | Description |
|---|---|
| ♥ **Remove Likes** | Automatically selects and unlikes posts in batches of 20 |
| 💬 **Delete Comments** | Bulk deletes your comments from posts |
| 🔖 **Untag from Saved Posts** | Removes your tag from saved posts one by one |
| ⏳ **Configurable wait** | Choose how long to wait between batches (20s / 30s / 45s / 60s) |
| 🚦 **Speed control** | Slow / Normal / Fast selection speed |
| 🔁 **Infinite loop** | Runs continuously until you press Stop |
| ⚠️ **Error recovery** | Automatically detects and dismisses Instagram error popups |

---

## 📦 Installation

> No build step required. Load directly in Chrome as an unpacked extension.

1. **Download** this repository (Code → Download ZIP) and unzip it
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right corner)
4. Click **"Load unpacked"**
5. Select the `instagram-cleaner-wait` folder
6. The 🧹 icon will appear in your Chrome toolbar

---

## 🚀 Usage

### Remove Likes
1. Go to [Instagram → Your Activity → Likes](https://www.instagram.com/your_activity/interactions/likes)
2. Click the extension icon
3. Choose your wait time and speed
4. Press **♥ Rimuovi Like**
5. The extension will: click "Seleziona" → select 20 posts → click "Non mi piace più" → confirm → wait → repeat

### Delete Comments
1. Go to [Instagram → Your Activity → Comments](https://www.instagram.com/your_activity/interactions/comments)
2. Press **💬 Elimina Commenti**
3. Same automatic flow as likes

### Untag from Saved Posts
1. Open a saved post carousel on Instagram
2. Press **🔖 Rimuovi Tag post salvati**
3. The extension will click "Rimuovi" then "Avanti" on each post in a loop

---

## ⚙️ Settings

**Wait between batches**
How long to pause after each batch before starting the next one. A longer wait reduces the risk of Instagram rate-limiting your account.

| Setting | Wait | Recommended for |
|---|---|---|
| 20s | 20 seconds | Testing |
| 30s | 30 seconds | Normal use |
| 45s | 45 seconds | Large volumes |
| 60s | 60 seconds | Extra safe |

**Selection speed**
How fast the extension clicks through individual items in each batch.

| Setting | Delay | Notes |
|---|---|---|
| 🐢 Sicuro | ~2.5s/item | Safest |
| ⚡ Normale | ~1.2s/item | Recommended |
| 🚀 Veloce | ~0.6s/item | Use with caution |

---

## 🛠️ How It Works

The extension injects a content script into Instagram's activity pages. It uses `realClick()` (dispatching `mousedown`, `mouseup`, and `click` events) to interact with Instagram's Bloks-based UI, targeting elements by their exact `data-testid`, `aria-label`, and CSS class selectors extracted directly from the live DOM.

The batch flow for likes:
```
clickSeleziona()        → finds span[data-bloks-name="bk.components.Text"] with text "Seleziona"
selectCells()           → finds [data-testid="bulk_action_checkbox"] items 6–25
clickActionBar()        → finds [aria-label="Non mi piace più"] with pointer-events: auto
clickConfirmPopup()     → finds button._a9-- with div._aac- (not ._aacx)
wait N seconds
repeat
```

---

## ⚠️ Known Limitations

- Instagram updates its UI frequently — selectors may break after app updates
- The extension can only select up to ~25 items visible in the viewport at once
- The first few posts in the grid may need to be skipped if they cause errors (configurable via code)
- Requires the Instagram tab to remain open and visible while running

---

## 🐛 Troubleshooting

**Extension doesn't find "Seleziona"**
→ Make sure you're on the correct page (`/your_activity/interactions/likes`). Try clicking the Diagnostics button in the log area.

**Stops after first batch**
→ Increase the wait time to 45s or 60s to give Instagram more time to process deletions.

**"Non mi piace più" button not clicked**
→ Instagram may have updated its UI. Open an issue with the HTML of the button you see.

**Error popup keeps appearing**
→ The extension handles this automatically — it detects `button._a9--` with `div._aacu` (the "OK" error button) and dismisses it before each batch.

---

## 📁 File Structure

```
instagram-cleaner-wait/
├── manifest.json      # Chrome extension manifest (MV3)
├── content.js         # Main automation logic injected into Instagram
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic and messaging
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 📄 License

MIT — free to use, modify, and distribute for personal use.

---

## 🤝 Contributing

Pull requests welcome! If Instagram updates its UI and breaks a selector, please open an issue with the relevant HTML from your browser's DevTools.
