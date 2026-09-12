/**
 * Gera as ilustrações do livro "50 Dinâmicas" com o Gemini
 * (gemini-3.1-flash-lite-image — Nano Banana 2 Lite, paid tier).
 *
 * Estilo: identidade lipeexplica — fundo escuro, luz vermelha #FF4D2D,
 * crianças chibi de kimono, traço cinematográfico.
 *
 * Uso: node scripts/generate-book-images.mjs <caminho-do-.env-com-GEMINI_API_KEY>
 * Saída: public/book/dinamica-XX.webp + public/book/capa.webp
 * Idempotente: pula imagens que já existem.
 */
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "book");
mkdirSync(outDir, { recursive: true });

// --- API key (nunca impressa) -----------------------------------------------
const envFile = readFileSync(process.argv[2], "utf8");
const keyMatch = envFile.match(/GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/);
if (!keyMatch) {
  console.error("GEMINI_API_KEY não encontrada");
  process.exit(1);
}
const API_KEY = keyMatch[1].trim();
const MODEL = "gemini-3.1-flash-lite-image";

// --- Carrega as dinâmicas do arquivo TS --------------------------------------
const ts = readFileSync(join(root, "src", "data", "dinamicas.ts"), "utf8");
const body = ts
  .replace(/import type[^\r\n]*\r?\n/, "")
  .replace(/export const dinamicas: Dinamica\[\] =/, "const dinamicas =")
  .replace(/export const categorias[\s\S]*$/, "return dinamicas;");
const dinamicas = new Function(body)();
console.log("dinâmicas carregadas:", dinamicas.length);

// --- Referência oficial do personagem (mascote 3D do canal) -------------------
const REF_PATH = String.raw`C:\Users\FOLP\Documents\Youtube Shorts\teste 1\videos\referência.png`;
const REF_B64 = readFileSync(REF_PATH).toString("base64");

// --- Prompt base --------------------------------------------------------------
const STYLE = `A imagem de referência anexada mostra o MASCOTE oficial "LipeExplica" (cabelo preto liso, olhos pretos redondos).

REGRAS DE PERSONAGENS (obrigatórias):
1. O mascote LipeExplica aparece EXATAMENTE UMA VEZ na cena, como protagonista em destaque, participando da ação.
2. TODAS as outras crianças são PERSONAGENS DIFERENTES entre si: meninos E meninas, tons de pele variados (claro, moreno, negro, asiático), cabelos variados (cacheado, crespo, loiro, ruivo, castanho, rabo de cavalo, coques, curto) — nenhuma pode ser cópia do mascote nem de outra criança.
3. Todos no MESMO estilo visual da referência: render 3D tipo boneco de vinil/argila (soft toy), cabeça grande redonda, olhos simples.
4. VESTUÁRIO: TODOS os kimonos são BRANCOS (como na referência) — a cor fica SOMENTE nas FAIXAS (branca, cinza, amarela, laranja, verde, azul). Nunca kimonos coloridos.

COMPOSIÇÃO: cena DINÂMICA de ação (movimento congelado, poses expressivas variadas), ângulo de câmera cinematográfico variado (não frontal estático).
CENÁRIO: tatame escuro estilizado com iluminação dramática vermelha (#FF4D2D) e leve névoa — estética do site lipeexplica.
Sem texto, sem letras, sem logotipos.`;

async function generate(prompt, aspectRatio, outPath, label) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: "image/png", data: REF_B64 } },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: { aspectRatio, imageSize: "1K" },
            },
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data).slice(0, 200)}`);

      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) throw new Error("sem imagem na resposta");

      const buf = Buffer.from(part.inlineData.data, "base64");
      await sharp(buf).webp({ quality: 82 }).toFile(outPath);
      console.log("ok:", label);
      return;
    } catch (err) {
      console.log(`retry ${attempt} ${label}: ${String(err).slice(0, 160)}`);
      await new Promise((r) => setTimeout(r, attempt * 4000));
    }
  }
  console.error("FALHOU:", label);
}

// --- Capa ---------------------------------------------------------------------
const jobs = [];

const capaPath = join(outDir, "capa.webp");
if (!existsSync(capaPath)) {
  jobs.push(() =>
    generate(
      `${STYLE}
Capa de livro épica: um professor chibi de kimono no centro de um tatame escuro,
cercado por várias crianças chibi de kimono em posições de brincadeira e treino,
luz vermelha dramática vinda de cima, atmosfera inspiradora de dojo à noite.`,
      "3:4",
      capaPath,
      "capa",
    ),
  );
}

// --- Uma ilustração por dinâmica ------------------------------------------------
for (const d of dinamicas) {
  const out = join(outDir, `dinamica-${String(d.id).padStart(2, "0")}.webp`);
  if (existsSync(out)) continue;
  const cena = `Cena da dinâmica "${d.titulo}" (categoria: ${d.categoria}):
${d.objetivo} ${d.passos[0] ?? ""}
Crianças chibi de kimono executando essa atividade no tatame, expressões alegres e energia de brincadeira.`;
  jobs.push(() => generate(`${STYLE}\n${cena}`, "16:9", out, `dinamica-${d.id}`));
}

console.log("a gerar:", jobs.length);

// concorrência 3
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const job = queue.shift();
      if (job) await job();
    }
  }),
);
console.log("concluído");
