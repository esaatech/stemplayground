# Electricity lab — material note illustrations

Drop **one image per material** here. The Electricity Flow Simulator “More” dialog loads them by **exact filename**.

| Material | Filename (pick one extension) |
|----------|-------------------------------|
| Copper   | `copper.png` or `copper.jpg` / `copper.webp` |
| Wood     | `wood.png` … |
| Plastic  | `plastic.png` … |

**Preferred:** PNG or WebP, roughly **800–1200px** wide, readable on mobile. Use **transparent background** only if the art needs it.

The app tries **PNG first**, then **JPG**, then **WebP** (see `src/content/electricityMaterialScience.ts` if you change extensions).

After adding files, run `npm run dev` and open **Engineering → Electricity → Lab**, choose a material, click **More**.

See also: `docs/electricity-material-dialog-images.md`.
