/**
 * Gera imagens para carrossel e stories do Instagram com o Gemini.
 * Uso: node scripts/generate-social-images.mjs .env.local
 * Saída: public/social/
 */
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "social");
mkdirSync(outDir, { recursive: true });

const envFile = readFileSync(process.argv[2] ?? join(root, ".env.local"), "utf8");
const keyMatch = envFile.match(/GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/);
if (!keyMatch) { console.error("GEMINI_API_KEY não encontrada"); process.exit(1); }
const API_KEY = keyMatch[1].trim();
const MODEL = "gemini-3.1-flash-lite-image";

const REF_PATH = String.raw`C:\Users\FOLP\Documents\Youtube Shorts\teste 1\videos\referência.png`;
const REF_B64 = readFileSync(REF_PATH).toString("base64");

const STYLE = `A imagem de referência mostra o MASCOTE oficial "LipeExplica" (cabelo preto liso, olhos pretos redondos, estilo 3D vinil/argila chibi).

REGRAS OBRIGATÓRIAS:
1. O mascote aparece EXATAMENTE UMA VEZ como protagonista. Nunca clonar.
2. Mesmo estilo visual da referência: render 3D soft toy, cabeça grande, olhos simples.
3. Kimono BRANCO. Cor apenas na faixa (aqui: faixa PRETA de professor).
4. Sem texto, letras ou logotipos na imagem.

ESTÉTICA: tatame escuro, luz cinematográfica vermelha (#D42B1C) como rim light, névoa leve, atmosfera de dojo noturno.`;

async function generate(prompt, aspectRatio, filename, label) {
  const outPath = join(outDir, filename);
  if (existsSync(outPath)) { console.log("skip (já existe):", label); return outPath; }

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: { "x-goog-api-key": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: "image/png", data: REF_B64 } },
                { text: prompt },
              ],
            }],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: { aspectRatio, imageSize: "1K" },
            },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data).slice(0, 300)}`);
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) throw new Error(`sem imagem na resposta: ${JSON.stringify(data).slice(0, 300)}`);
      const buf = Buffer.from(part.inlineData.data, "base64");
      await sharp(buf).webp({ quality: 85 }).toFile(outPath);
      console.log("✓", label, "→", filename);
      return outPath;
    } catch (err) {
      console.log(`retry ${attempt} [${label}]: ${String(err).slice(0, 200)}`);
      await new Promise((r) => setTimeout(r, attempt * 5000));
    }
  }
  console.error("✗ FALHOU:", label);
  return null;
}

const jobs = [
  () => generate(
    `${STYLE}

CENA — Slide 1 (carrossel Instagram, quadrado):
O mascote LipeExplica de kimono branco e faixa preta está em pose de dúvida/questionamento:
braço cruzado no peito, outra mão no queixo, sobrancelha levantada, olhar pensativo.
Posicionado à DIREITA do frame, deixando 40% de espaço escuro à esquerda para texto.
Ângulo ligeiramente de baixo para cima (câmera low angle), perspectiva dinâmica.
Rim light vermelho intenso (#D42B1C) vindo da direita iluminando o contorno do personagem.
Fundo: tatame escuro, névoa sutil ao fundo inferior.`,
    "1:1", "slide-01-hook.webp", "slide-01-hook"
  ),
  () => generate(
    `${STYLE}

CENA — Slide 3 (carrossel Instagram, quadrado):
O mascote LipeExplica de kimono branco e faixa preta está segurando um livro aberto
com as duas mãos acima da cabeça em gesto de vitória/celebração.
Expressão de alegria máxima: sorriso enorme, olhos animados.
Corpo levemente inclinado para frente, energia triunfante.
Personagem centralizado no frame, ângulo levemente de baixo para cima.
Rim light dourado (#C49419) em cima + rim light vermelho (#D42B1C) nas bordas laterais.
Partículas/brilhos ao redor do livro. Fundo tatame escuro estilizado.`,
    "1:1", "slide-03-solution.webp", "slide-03-solution"
  ),
  () => generate(
    `${STYLE}

CENA — Story 1 (Stories Instagram, vertical 9:16):
O mascote LipeExplica de kimono branco e faixa preta está centralizado no tatame.
Expressão de surpresa total: olhos arregalados, boca aberta, uma mão levantada na altura
da cabeça em gesto de espanto, corpo ligeiramente inclinado para trás.
Corpo INTEIRO visível (full body shot), bastante espaço negro acima e abaixo do personagem
para acomodar texto de Stories.
Rim light vermelho bilateral (#D42B1C) nos dois lados criando halo dramático.
Nevoa sutil ao nível do tatame. Composição centrada vertical.`,
    "9:16", "story-01-hook.webp", "story-01-hook"
  ),
];

console.log("gerando", jobs.length, "imagens...");
for (const job of jobs) await job();
console.log("concluído → public/social/");
