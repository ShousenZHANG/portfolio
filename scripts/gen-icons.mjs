// Rasterises public/apple-touch-icon.svg -> public/apple-touch-icon.png (180x180).
//
// WHY this exists: Safari's home-screen icon pipeline only accepts raster formats.
// An <link rel="apple-touch-icon"> pointing at an SVG is silently ignored and iOS
// falls back to a screenshot of the page. The SVG stays the single source of truth
// for geometry and colour; this script is the build step that makes iOS see it.
//
// Run: node scripts/gen-icons.mjs   (re-run whenever apple-touch-icon.svg changes)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public", "apple-touch-icon.svg");
const OUT = path.join(ROOT, "public", "apple-touch-icon.png");
const SIZE = 180;

// iOS masks home-screen icons with its own superellipse. Baking the SVG's rx="15"
// corners into the raster means two different curves fighting: wherever Apple's mask
// is wider than our arc, the corner shows the composite behind it instead of the
// gradient. So flatten the corner radius and render the artwork edge to edge — the
// only shape that lets the system mask land cleanly. The browser-tab favicon keeps
// its rx="15", because nothing masks that one.
const SQUARE_CORNERS = ['<rect width="64" height="64" rx="15"', '<rect width="64" height="64" rx="0"'];

const svg = await readFile(SRC, "utf8");
if (!svg.includes(SQUARE_CORNERS[0])) {
  throw new Error(`gen-icons: outer rect not found in ${SRC} — the artwork changed shape, update SQUARE_CORNERS.`);
}

const png = await sharp(Buffer.from(svg.replace(SQUARE_CORNERS[0], SQUARE_CORNERS[1])), { density: 384 })
  .resize(SIZE, SIZE, { fit: "fill" })
  // Apple composites the icon over a light home screen; an alpha channel there reads
  // as haloing. Nothing should be transparent once the corners are square, so this
  // only backstops sub-pixel edge antialiasing — but it guarantees a fully opaque file.
  .flatten({ background: "#07080e" })
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(OUT, png);

const { width, height, channels, hasAlpha } = await sharp(png).metadata();
const { isOpaque, dominant } = await sharp(png).stats();
console.log(
  `apple-touch-icon.png  ${width}x${height}  channels=${channels}  hasAlpha=${hasAlpha}  ` +
    `opaque=${isOpaque}  dominant=rgb(${dominant.r},${dominant.g},${dominant.b})  ${png.length} bytes`
);
