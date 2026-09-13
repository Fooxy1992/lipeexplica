/**
 * scripts/optimize-images.mjs
 *
 * Converte os assets principais para WebP e AVIF sem remover os originais.
 * Os arquivos originais (.png) continuam no disco — Next.js Image os serve como
 * fallback automático; os novos arquivos (.webp / .avif) são entregues por
 * <Image> via `next/image` (que negocia o formato com o browser).
 *
 * Uso: node scripts/optimize-images.mjs
 */

import sharp from "sharp";
import { readFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

const TARGETS = [
  {
    input: "character.png",
    // Personagem: max 1440px wide, preserva transparência
    resize: { width: 1440, fit: "inside", withoutEnlargement: true },
    formats: ["webp", "avif"],
  },
  {
    input: "logotipo.png",
    // Logo: max 512px (usado em avatar 36px–256px)
    resize: { width: 512, fit: "inside", withoutEnlargement: true },
    formats: ["webp", "avif"],
  },
  {
    input: "favicon.png",
    // Favicon: 512px para ICO/PNG pipeline do Next.js
    resize: { width: 512, fit: "inside", withoutEnlargement: true },
    formats: ["webp"],
  },
];

function fmt(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

for (const target of TARGETS) {
  const inputPath = join(PUBLIC, target.input);
  const originalSize = statSync(inputPath).size;
  const baseName = target.input.replace(/\.[^.]+$/, "");

  console.log(`\n▸ ${target.input} (${fmt(originalSize)})`);

  for (const format of target.formats) {
    const outputName = `${baseName}.${format}`;
    const outputPath = join(PUBLIC, outputName);

    const options =
      format === "avif"
        ? { quality: 60, effort: 6 }
        : { quality: 82, effort: 6 };

    await sharp(inputPath)
      .resize(target.resize)
      [format](options)
      .toFile(outputPath);

    const newSize = statSync(outputPath).size;
    const saved = (((originalSize - newSize) / originalSize) * 100).toFixed(0);
    console.log(`  ✓ ${outputName} → ${fmt(newSize)}  (−${saved}%)`);
  }
}

console.log("\n✅ Otimização concluída. Originais .png preservados.\n");
