# Google Sheets Desktop Wallpaper (GitHub Pages)

A lightweight Chrome homepage that reads image URLs from your Google Sheet and uses the selected image as a full-screen background. It is static HTML/CSS/JavaScript, so it works on GitHub Pages without a backend or API key.

## 1. Prepare your Google Sheet

Use the first row as column headings:

| Desktop | Image URL |
|---|---|
| Office | https://example.com/office-wallpaper.jpg |
| Home | https://example.com/home-wallpaper.jpg |
| Laptop | https://example.com/laptop-wallpaper.jpg |

- Put a desktop/device name in **Desktop**.
- Put a direct, publicly accessible image URL in **Image URL**.
- Use direct image links that open the image itself (usually `.jpg`, `.png`, `.webp`, etc.). A Google Drive sharing page is not a direct image URL.
- In Google Sheets, choose **Share → General access → Anyone with the link → Viewer**.
- The code reads the tab named `Sheet1`. Change `SHEET_TAB` in `script.js` if your tab has another name.

The spreadsheet ID is already filled in for the sheet supplied with this project.

## 2. Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Wait for GitHub Pages to publish your site. The address will look like `https://YOUR-USERNAME.github.io/REPOSITORY/`.

## 3. Set a different wallpaper on each desktop

Use the same published site with a different query string:

- Office desktop: `https://YOUR-USERNAME.github.io/REPOSITORY/?desktop=Office`
- Home desktop: `https://YOUR-USERNAME.github.io/REPOSITORY/?desktop=Home`
- Laptop: `https://YOUR-USERNAME.github.io/REPOSITORY/?desktop=Laptop`

You can also select by row order: `?desktop=1` selects the first data row, `?desktop=2` the second, and so on.

## 4. Use it in Chrome

A normal website cannot replace Chrome's built-in **New Tab** page by itself. You can use this page as the Chrome startup page or Home button:

- **Startup page:** Chrome → Settings → On startup → Open a specific page or set of pages → Add the desktop-specific URL.
- **Home button:** Chrome → Settings → Appearance → Show home button → enter the desktop-specific URL.

For a true custom New Tab page, a Chrome extension is required.

## Notes

- The page refreshes the selected wallpaper every 15 minutes and has a manual refresh button.
- The image URL must be accessible without signing in. Some hosts block hotlinking; if an image does not appear, use another direct image host.
- The first two columns are used as a fallback if the headings are not recognized. Recommended headings are exactly `Desktop` and `Image URL`.
