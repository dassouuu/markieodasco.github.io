# AI Video Specialist portfolio — easy-edit edition

Start with **READ-ME-FIRST.txt**, then **EDITING-GUIDE.md**. Edit only **portfolio.ini** for your profile and projects.

- Videos: `assets/videos/your-project.mp4`
- Thumbnails: `assets/thumbnails/your-project.jpg`
- Windows local preview: save the INI → double-click `UPDATE-PORTFOLIO.cmd` → open `START-HERE.html`.
- GitHub Pages: `index.html` reads `portfolio.ini` directly. Upload the changed configuration and any new media to update your live projects.

Thirteen supplied video projects are included with extracted thumbnails and web-compatible H.264/AAC MP4s. Your profile photo, email, WhatsApp link, and Discord username are configured. The six original illustrated concepts are retained but disabled. No client affiliations or performance results are claimed. The brief form opens an email draft; it never automatically sends messages. See VIDEO-PROJECTS.md for the source mapping and media checks.

## Files

| File/folder | Purpose |
|---|---|
| `portfolio.ini` | The only profile/project configuration you edit. |
| `UPDATE-PORTFOLIO.cmd` | Double-click Windows preview updater. |
| `START-HERE.html` | Generated preview with embedded styling, scripts, and thumbnails. MP4s remain external. |
| `index.html` | Published homepage; reads the INI directly on HTTP(S). |
| `config-data.js` | Generated INI snapshot for double-click local index preview. Do not edit. |
| `portfolio-config.js` | INI parser/validator; automatic categories, paths, and readable errors. |
| `styles.css` / `app.js` | Design and website behavior. No project editing required here. |
| `assets/videos/` | Your MP4 files. |
| `assets/thumbnails/` | Your gallery thumbnail images. |
| `assets/*.svg` | Original hero artwork and favicon. |
| `scripts/build-site.ps1` | Windows updater implementation. |
| `scripts/build_preview.py` | Optional portable updater when Python is available. |
| `scripts/check_site.py` | HTML references, IDs, SVG and responsive-rule checks. |
| `scripts/check_config.cjs` | Snapshot freshness and referenced media checks. |
| `scripts/test_config.cjs` | INI syntax/defaults/errors and hosted-loading tests. |
| `scripts/test_interactions.cjs` | Application and generated-preview behavior checks using a DOM harness. |

## Optional developer checks

From the extracted folder:

```sh
python3 scripts/build_preview.py
python3 scripts/check_site.py
node scripts/check_config.cjs
node scripts/test_config.cjs
node scripts/test_interactions.cjs
node --check app.js
node --check portfolio-config.js
```

No developer tools are required for the normal Windows editing workflow. The Windows PowerShell updater was reviewed but not executed because PowerShell was unavailable in the build environment. Interaction tests use a lightweight DOM harness, not an actual browser. Actual desktop/mobile rendering and video playback remain to be checked locally.

Existing live GitHub Pages content has not been modified. Before replacing it, back up the current repository. Use its configured publishing branch/folder and preserve CNAME if applicable. A static root deployment typically uses Settings → Pages → Deploy from a branch → main → /(root). See the editing guide for the exact files to upload.

## Publishing the video files

Every included MP4 is below 25 MiB, so it fits GitHub's browser file-upload limit. Upload the extracted website contents, including the video and thumbnail folders; do not upload the ZIP itself as the homepage. For a `main`/root publishing setup, `index.html` must sit at the root of the repository. Preserve your existing source folder and CNAME if different. The total site size is recorded in VIDEO-PROJECTS.md.

Official GitHub documentation:
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Additional media verification (requires ffmpeg and ffprobe): `python3 scripts/check_media.py`. This checks the actual video/audio streams, duration, size, and fast-start metadata, and decodes all files. Browser playback has not been tested in the build environment, and this version has not been deployed to the live GitHub repository.
