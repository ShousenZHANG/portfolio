// One-off: convert public/images/* to WebP, cap width at 1600px.
// Run: node scripts/convert-images.mjs
import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const MAX_W = 1600;

const files = await readdir(DIR);
for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;
  const src = join(DIR, file);
  const out = join(DIR, `${basename(file, ext)}.webp`);
  const img = sharp(src);
  const meta = await img.metadata();
  const pipeline = meta.width > MAX_W ? img.resize({ width: MAX_W }) : img;
  await pipeline.webp({ quality: 82 }).toFile(out);
  const before = (await stat(src)).size;
  const after = (await stat(out)).size;
  console.log(
    `${file} ${(before / 1024).toFixed(0)}KB -> ${basename(out)} ${(after / 1024).toFixed(0)}KB ` +
    `(${Math.round((1 - after / before) * 100)}% smaller)`
  );
}
console.log("Done.");
