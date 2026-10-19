# Daily Export Program Executive Dashboard

A single-page web app that draws the daily export program dashboard on a canvas and lets you download it as a **JPG** or an **Excel (.xlsx)** file. It installs as a PWA (icons included).

## Files

```
index.html              page
css/style.css           page styles
js/data.js              default program data (edit this)
js/app.js               dashboard drawing, JPG + Excel export
sw.js                   offline cache (service worker)
manifest.webmanifest    PWA manifest
icons/                  logo-192.png, logo-512.png, logo-512-maskable.png, favicon-32.png
icons/alt/              alternative badge design (name plate at the bottom)
tools/make_logos.py     rebuilds the icons from the source photo (cut-out + new background)
.github/workflows/      GitHub Pages deploy
```

## Change the data

Open `js/data.js`, or use **Edit program data** on the page (saved in your browser). Each row lists its vehicles per transporter as `[feet, count]`:

```js
trips: { salim: [[23, 2], [14, 1]], shahjoki: [[23, 1]] }
```

Cargo counts, percentages, totals, the donut chart and the fleet bar chart are all calculated from `trips`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish on GitHub Pages

```bash
git init
git add .
git commit -m "Export dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: GitHub Actions**. The included workflow deploys on every push to `main`.

## Rebuild the logo

```bash
pip install pillow numpy opencv-python
python3 tools/make_logos.py tools/source-logo-512.png icons
```

The script cuts the photo out of the old background and redraws it on a new one. Edit the colours in `radial_bg(...)` and the text in `tools/make_logos.py` to restyle. To use the alternative design, copy the files from `icons/alt/` over `icons/`.

## Notes

The Excel export uses SheetJS from cdnjs, so the first load needs internet. Dashboard values in `js/data.js` are sample data: replace them with your real program.
