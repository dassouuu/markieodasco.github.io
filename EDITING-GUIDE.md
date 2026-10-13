# Edit your portfolio without touching JavaScript

Your only editable configuration file is **`portfolio.ini`**. It is plain text: `setting=value` lines. You do not need quotation marks, curly brackets, commas, or JavaScript.

## First preview on Windows

Right-click the ZIP → **Extract All → Extract**. Open the extracted folder and double-click **`START-HERE.html`**. If necessary, right-click it → **Open with → Microsoft Edge or Google Chrome**.

Keep the extracted folder together. The preview embeds styles, scripts, and thumbnail artwork, but actual MP4 videos stay in the `assets/videos` folder beside it.

## Where your files go

| File | Put it here | Write this in portfolio.ini |
|---|---|---|
| First AI UGC video | `assets/videos/skincare-ad.mp4` | `video=skincare-ad.mp4` |
| Its JPG thumbnail | `assets/thumbnails/skincare-ad.jpg` | `thumbnail=skincare-ad.jpg` |
| Product ad video | `assets/videos/headphone-ad.mp4` | `video=headphone-ad.mp4` |
| Its PNG thumbnail | `assets/thumbnails/headphone-ad.png` | `thumbnail=headphone-ad.png` |
| Animation video | `assets/videos/space-animation.mp4` | `video=space-animation.mp4` |
| Its WebP thumbnail | `assets/thumbnails/space-animation.webp` | `thumbnail=space-animation.webp` |

You choose the filenames. Use lowercase letters, numbers, and hyphens, and match the actual filenames exactly. Enter **only filenames** in the configuration. Do not paste `C:\Users\...`, folder paths, URLs, or filenames containing spaces.

Videos must have `.mp4` filenames. H.264 video with AAC audio is a good compatibility choice. Thumbnail extensions supported: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`. Thumbnails are cropped to fill the cards: keep the subject near the center.

## Add your first project

1. Copy your video and thumbnail to the two folders above.
2. Right-click `portfolio.ini` → **Open with → Notepad**.
3. Paste this complete block at the end of the file:

```ini
[project:skincare-ad]
title=My skincare AI UGC ad
category=ugc
description=Describe the actual project, creative direction, and your contribution.
video=skincare-ad.mp4
thumbnail=skincare-ad.jpg
placeholder=no
tags=9:16 | AI UGC | Video editing
```

4. Press **Ctrl+S** in Notepad.
5. Double-click **`UPDATE-PORTFOLIO.cmd`**. A small command window will show whether the update succeeded. It uses Windows' built-in PowerShell; you do not need to install anything.
6. Reopen or refresh **`START-HERE.html`**. Click the project to watch the video.

If the updater reports a missing file, its message tells you exactly where it expects the file. Fix the filename or copy the file to that location and run the updater again. Invalid configuration syntax displays a readable error with a line number in the website preview.

## Add more projects

Copy the entire block, starting with `[project:...]`, and paste another copy below it. Change the heading, title, filenames, and description. Every project heading must be unique. The block order is the gallery order; move an entire block to reorder projects.

Product example:

```ini
[project:headphone-ad]
title=My headphone product ad
category=product
description=Describe your product ad here.
video=headphone-ad.mp4
thumbnail=headphone-ad.png
placeholder=no
tags=Product ad | Cinematic lighting
```

Animation example:

```ini
[project:space-animation]
title=My space animation
category=animation
description=Describe your animation here.
video=space-animation.mp4
thumbnail=space-animation.webp
placeholder=no
tags=AI animation | World building
```

These are instructions, not included real projects or videos. Copy your own files before enabling them.

## What each setting does

| Setting | Meaning |
|---|---|
| `[project:skincare-ad]` | Unique project ID: lowercase letters, numbers, and hyphens. |
| `title=` | The title visitors see. Required. |
| `category=` | Exactly `ugc`, `product`, or `animation`. Determines filter and label. Required. |
| `description=` | Your project description on one line. Quotes, apostrophes, commas, and equals signs are ordinary text. |
| `video=` | MP4 filename inside `assets/videos`. If omitted for a real project, defaults to the project ID + `.mp4`. |
| `thumbnail=` | Image filename inside `assets/thumbnails`. If omitted, defaults to the project ID + `.jpg`. |
| `placeholder=no` | Use for your real work. `yes` clearly labels an illustrative concept and allows an empty video. Defaults to `no`. |
| `tags=` | Short labels separated by `|`. Optional. |
| `enabled=no` | Hide a project without deleting its block. Optional; default is `yes`. |

Do not add comments after values. Put comments on their own lines beginning with `#` or `;`. Keep keys lowercase. Avoid duplicate keys inside a block. Do not put a multiline paragraph after `description=`; use one line.

To remove a project, delete its entire block. To hide the initial six concepts, add `enabled=no` to each concept block, or delete those blocks. The portfolio never invents client experience or results. This version already includes your thirteen supplied videos; the six original concepts are retained with enabled=no.

## Edit your personal details

At the top, under `[profile]`, change:

```ini
[profile]
name=Your professional name
email=your-real-email@example.com
whatsapp=+639957585817
discord=dassouuu.
about=Your actual introduction, in one line.
skills=Creative direction | Storyboarding | Video editing
tools=Your actual tool | Another tool | Editing software
tools-note=Your optional note about your workflow.
```

Keep only one `[profile]` section. Replace the example address with your own email or leave `email=` blank. Only list skills and tools you actually use.

Then save and double-click `UPDATE-PORTFOLIO.cmd` for your local preview. When an email is configured, the brief builder provides an **Open email draft** link. It still does not automatically send a message.

## Update your existing GitHub Pages site

For your initial upload, put `index.html`, `styles.css`, `app.js`, `portfolio-config.js`, `config-data.js`, `portfolio.ini`, `.nojekyll`, and the entire `assets` folder in the repository's publishing folder. Preserve any existing custom domain file and publishing configuration. `START-HERE.html` is for your local preview; your homepage is `index.html`.

Your hosted `index.html` reads **`portfolio.ini` directly**. After the first upload, adding a project only requires uploading the changed **`portfolio.ini`**, the new **MP4**, and its **thumbnail**, preserving the folder paths. Commit those changes and let GitHub Pages redeploy. No JavaScript editing or build command is required for the hosted version.

Local double-click preview reads a generated snapshot because browsers restrict reading neighboring text files. That is why you run `UPDATE-PORTFOLIO.cmd` after local edits. `config-data.js` and `START-HERE.html` are generated automatically; do not edit them manually.

## Troubleshooting

- **Old projects in local preview:** save `portfolio.ini`, run the updater, then reopen/refresh the HTML. Make sure you are opening the newly extracted folder.
- **Plain page:** open `START-HERE.html` after extracting the full ZIP.
- **File missing:** check the indicated folder and exact filename. In File Explorer, enable **View → Show → File name extensions** to detect accidental `.jpg.jpg` or `.mp4.mp4` names.
- **Video player appears but video will not play:** confirm the MP4 contains a browser-compatible encoding. Renaming a non-MP4 video does not convert it.
- **Configuration error:** follow the shown line number. Check the spelling of keys, category, filenames, and yes/no flags.
- **Published config missing:** upload `portfolio.ini` alongside `index.html`. The hosted site deliberately reports a configuration error instead of silently showing outdated projects.

The updater runs with an execution-policy setting scoped to its own PowerShell process; it does not change your computer's persistent execution policy. Windows PowerShell execution was not available in the build environment, so the Windows launcher has been reviewed but not run on a Windows laptop. Source/configuration tests and generated-preview tests passed; browser rendering and actual media playback still need your local check.

## This integrated version

Your email and WhatsApp link are live in the contact section. Discord is shown as `dassouuu.` exactly as supplied, with a copy button; it does not invent a Discord profile URL. You can edit `whatsapp=` and `discord=` under `[profile]`. Your photo is `assets/profile.jpg`.

The gallery includes thirteen videos from five successfully available archives and two individual uploads. The earlier unavailable archives were not read. Your later individual uploads sample11.mp4 and sample22.mp4 are now included as animation projects. Send any additional videos individually.

The included MP4s are web-optimized copies, not the large originals. Use these included files for the website. Preserve the `assets/videos` folder when opening the preview or uploading to GitHub.
