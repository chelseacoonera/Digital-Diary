# MORI — Digital Diary

A responsive, client-side digital diary ready for GitHub Pages.

## Features
- Diary entries with title, date, mood, tags, song and rating
- Optional memory photos stored locally
- Mood tracker + monthly mood calendar
- Memory gallery
- Search and tag filtering
- Light / night mode
- Custom display name
- JSON export backup
- Responsive desktop/tablet/mobile UI
- No backend required

## GitHub Pages
1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, `script.js`, and the `assets` folder.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then **Save**.
6. Open the Pages URL GitHub provides.

## Privacy note
MORI uses browser `localStorage`. Diary data stays in the browser where it was entered; it is not uploaded to GitHub by this app. Clearing browser site data can remove it, so use the JSON export for backups.

## Optional offline use
The Google Fonts import is only for typography. The rest of the app is static and can run without a backend.
