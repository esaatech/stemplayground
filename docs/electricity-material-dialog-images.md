# Electricity lab — “More” dialog images

The **Electricity Flow Simulator** (`/engineering/electricity/lab`) shows a short material note on the page. **More** opens a dialog with longer text and an **illustration** slot.

## Where to put image files

Use this folder in the repo (served as static files by Vite):

```text
public/images/engineering/electricity/material-notes/
```

Add **one image per material**, using these **base names** (any of the listed extensions is tried in order until one loads):

| Material | Files tried (in order) |
|----------|-------------------------|
| Copper   | `copper.png`, `copper.jpg`, `copper.webp` |
| Wood     | `wood.png`, `wood.jpg`, `wood.webp` |
| Plastic  | `plastic.png`, `plastic.jpg`, `plastic.webp` |

**Examples:** `plastic.png` or `copper.jpg` only — no subfolders per material.

## Code references

- **Image base path and fallbacks:** `src/content/electricityMaterialScience.ts` (`MATERIAL_NOTE_IMAGE_BASE`, `materialNoteImageCandidates`)
- **Dialog UI:** `src/components/MaterialScienceMoreDialog.tsx`
- **Short note (unchanged on page):** `MATERIAL_SCIENCE_NOTE` in `src/components/ElectricityFlowDemo.tsx`
- **Long copy:** `MATERIAL_SCIENCE_DETAIL` in `src/content/electricityMaterialScience.ts`

## If no file is present

The dialog shows a short **placeholder** message listing the filenames it looked for. After you add a valid file, refresh the app and open **More** again.

## Tips for assets

- Prefer **PNG** or **WebP** for diagrams; **JPG** for photos.
- Aim for **~800–1200px** width so it stays sharp on desktop but does not bloat the repo.
- Use **descriptive `imageAlt`** text in `electricityMaterialScience.ts` when you replace the generic alt with something specific to your diagram.
