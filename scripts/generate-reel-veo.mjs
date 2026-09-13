/**
 * Gera 1 clipe de reel com Veo 3.1 Lite (720p, 9:16) anunciando a volta dos vídeos.
 *
 * Fluxo:
 *   1. Gera o frame inicial com gemini-3.1-flash-lite-image usando o mascote de referência
 *   2. Envia esse frame para o Veo (image-to-video) e aguarda a operação
 *   3. Baixa o mp4 em out/reels/
 *
 * Uso: node scripts/generate-reel-veo.mjs [.env.local]
 *
 * Custo aproximado: $0.03 (imagem) + 8s x $0.05 = ~$0.43
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out", "reels");
mkdirSync(outDir, { recursive: true });

const envFile = readFileSync(process.argv[2] ?? join(root, ".env.local"), "utf8");
const keyMatch = envFile.match(/GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/);
if (!keyMatch) {
  console.error("GEMINI_API_KEY não encontrada");
  process.exit(1);
}
const API_KEY = keyMatch[1].trim();

const IMAGE_MODEL = "gemini-3.1-flash-lite-image";
const VIDEO_MODEL = "veo-3.1-lite-generate-preview";
const API = "https://generativelanguage.googleapis.com/v1beta";

const REF_PATH = String.raw`C:\Users\FOLP\Documents\Youtube Shorts\teste 1\videos\referência.png`;

const FRAME_PATH = join(outDir, "volta-frame.png");
const VIDEO_PATH = join(outDir, "volta-veo-lite.mp4");

/* ══════════════════════════════════════════
   1. FRAME INICIAL
══════════════════════════════════════════ */

const FRAME_PROMPT = `Use o mascote da imagem de referência como protagonista.

PERSONAGEM (obrigatório):
- Chibi 3D estilo vinil, cabelo preto liso, olhos pretos redondos
- Kimono BRANCO, faixa PRETA
- Sem texto na roupa ou acessórios

CENA (vertical 9:16, primeiro frame de um vídeo):
- O mascote de pé no centro do tatame escuro (#080808), corpo inteiro visível
- Postura confiante, braços cruzados, olhando para a câmera
- Névoa sutil no chão, partículas de poeira no ar
- Rim light vermelho intenso (#D42B1C) nas bordas do personagem
- Fundo: academia de jiu-jitsu escura e desfocada, profundidade cinematográfica
- Iluminação dramática tipo fight card, premium, cinematográfico
- SEM nenhum texto, letra ou logo na imagem`;

async function generateFrame() {
  if (existsSync(FRAME_PATH)) {
    console.log("skip: frame já existe →", FRAME_PATH);
    return readFileSync(FRAME_PATH).toString("base64");
  }

  const refB64 = readFileSync(REF_PATH).toString("base64");
  console.log("gerando frame inicial...");

  const res = await fetch(`${API}/models/${IMAGE_MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/png", data: refB64 } },
            { text: FRAME_PROMPT },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "9:16", imageSize: "1K" },
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`imagem ${res.status}: ${JSON.stringify(data).slice(0, 400)}`);

  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`sem imagem: ${JSON.stringify(data).slice(0, 400)}`);

  const b64 = part.inlineData.data;
  writeFileSync(FRAME_PATH, Buffer.from(b64, "base64"));
  console.log("✓ frame →", FRAME_PATH);
  return b64;
}

/* ══════════════════════════════════════════
   2. VÍDEO (VEO)
══════════════════════════════════════════ */

const VIDEO_PROMPT = `Vídeo vertical cinematográfico de 8 segundos numa academia de jiu-jitsu escura.

AÇÃO:
O mascote chibi de kimono branco e faixa preta está de braços cruzados no centro do tatame.
Ele descruza os braços devagar, dá um passo à frente e ajusta a faixa preta com as duas mãos,
depois olha diretamente para a câmera com um leve sorriso confiante e aperta o punho.

CÂMERA:
Dolly in lento e suave, do plano médio para o plano aproximado. Leve movimento de câmera na mão,
profundidade de campo rasa, fundo desfocado.

LUZ E CLIMA:
Tatame escuro, névoa baixa, partículas de poeira flutuando na luz.
Rim light vermelho intenso recortando o personagem contra o fundo preto.
Estética fight card, premium, alto contraste.

ÁUDIO:
Trilha instrumental de percussão grave e crescente, com um impacto grave no último segundo.
Som ambiente sutil de tatame. SEM narração, SEM vozes, SEM fala.`;

const NEGATIVE_PROMPT =
  "texto, legenda, letras, marca d'água, logo, distorção, múltiplos personagens, rosto deformado, mãos deformadas, fala, boca se mexendo, legenda embutida";

async function generateVideo(imageB64) {
  if (existsSync(VIDEO_PATH)) {
    console.log("skip: vídeo já existe →", VIDEO_PATH);
    return;
  }

  console.log("enviando job para o Veo...");
  const startRes = await fetch(`${API}/models/${VIDEO_MODEL}:predictLongRunning`, {
    method: "POST",
    headers: { "x-goog-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [
        {
          prompt: VIDEO_PROMPT,
          image: { bytesBase64Encoded: imageB64, mimeType: "image/png" },
        },
      ],
      parameters: {
        aspectRatio: "9:16",
        resolution: "720p",
        negativePrompt: NEGATIVE_PROMPT,
        generateAudio: true,
      },
    }),
  });

  const startData = await startRes.json();
  if (!startRes.ok) throw new Error(`veo ${startRes.status}: ${JSON.stringify(startData).slice(0, 600)}`);

  const opName = startData.name;
  console.log("operação:", opName);

  let op = startData;
  for (let i = 0; i < 60 && !op.done; i++) {
    await new Promise((r) => setTimeout(r, 10_000));
    const pollRes = await fetch(`${API}/${opName}`, { headers: { "x-goog-api-key": API_KEY } });
    op = await pollRes.json();
    console.log(`  poll ${i + 1}: done=${Boolean(op.done)}`);
  }

  if (!op.done) throw new Error("timeout esperando o Veo");
  if (op.error) throw new Error(`veo erro: ${JSON.stringify(op.error).slice(0, 600)}`);

  const resp = op.response ?? {};
  const sample =
    resp.generateVideoResponse?.generatedSamples?.[0] ??
    resp.generatedSamples?.[0] ??
    resp.videos?.[0];
  if (!sample) throw new Error(`resposta inesperada: ${JSON.stringify(resp).slice(0, 800)}`);

  const uri = sample.video?.uri ?? sample.uri;
  const inlineB64 = sample.video?.bytesBase64Encoded ?? sample.bytesBase64Encoded;

  if (inlineB64) {
    writeFileSync(VIDEO_PATH, Buffer.from(inlineB64, "base64"));
  } else if (uri) {
    const dl = await fetch(uri, { headers: { "x-goog-api-key": API_KEY } });
    if (!dl.ok) throw new Error(`download ${dl.status}`);
    writeFileSync(VIDEO_PATH, Buffer.from(await dl.arrayBuffer()));
  } else {
    throw new Error(`sem vídeo na resposta: ${JSON.stringify(sample).slice(0, 600)}`);
  }

  console.log("✓ vídeo →", VIDEO_PATH);
}

/* ══════════════════════════════════════════
   EXECUÇÃO
══════════════════════════════════════════ */

const frameB64 = await generateFrame();
await generateVideo(frameB64);
console.log("\nconcluído → out/reels/");
