/**
 * Gera os slides finais do carrossel + stories com texto integrado na imagem.
 * Uso: node scripts/generate-social-final.mjs [.env.local]
 * Saída: public/social-final/
 */
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "social-final");
mkdirSync(outDir, { recursive: true });

const envFile = readFileSync(process.argv[2] ?? join(root, ".env.local"), "utf8");
const keyMatch = envFile.match(/GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/);
if (!keyMatch) { console.error("GEMINI_API_KEY não encontrada"); process.exit(1); }
const API_KEY = keyMatch[1].trim();
const MODEL = "gemini-3.1-flash-lite-image";

const REF_PATH = String.raw`C:\Users\FOLP\Documents\Youtube Shorts\teste 1\videos\referência.png`;
const REF_B64 = readFileSync(REF_PATH).toString("base64");

const CHAR_RULES = `PERSONAGEM (obrigatório):
- Usar o mascote da imagem de referência: chibi 3D vinil, cabelo preto liso, olhos pretos redondos
- Kimono BRANCO, faixa PRETA
- Aparece 1× por cena como protagonista
- Sem texto na roupa ou acessórios`;

const BRAND_STYLE = `ESTÉTICA DA MARCA:
- Fundo: tatame escuro (#080808), névoa sutil
- Iluminação: rim light vermelho intenso (#D42B1C)
- Tipografia: letras bold condensadas estilo Impact, sem serifas
- Cor do texto principal: branco (#F2F2F2)
- Destaques: vermelho (#D42B1C)
- Estilo geral: fight card, esportivo, premium, cinematográfico`;

const TEXT_RULES = `REGRAS DE TEXTO NA IMAGEM:
- Texto em português, exatamente como descrito
- Fonte bold condensada, sem serifas (estilo Impact)
- Texto branco sobre fundo escuro, ou vermelho para ênfase
- Posicione o texto conforme indicado no layout
- O texto deve ser legível e clean, sem distorções`;

async function generate(prompt, aspectRatio, filename, label, useRef = false) {
  const outPath = join(outDir, filename);
  if (existsSync(outPath)) { console.log("skip:", label); return; }

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const parts = [];
      if (useRef) {
        parts.push({ inlineData: { mimeType: "image/png", data: REF_B64 } });
      }
      parts.push({ text: prompt });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: { "x-goog-api-key": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
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
      if (!part) throw new Error(`sem imagem: ${JSON.stringify(data).slice(0, 200)}`);
      const buf = Buffer.from(part.inlineData.data, "base64");
      await sharp(buf).webp({ quality: 88 }).toFile(outPath);
      console.log("✓", label, "→", filename);
      return;
    } catch (err) {
      console.log(`retry ${attempt} [${label}]: ${String(err).slice(0, 160)}`);
      await new Promise((r) => setTimeout(r, attempt * 6000));
    }
  }
  console.error("✗ FALHOU:", label);
}

/* ══════════════════════════════════════════
   CARROSSEL — 7 slides 1:1
══════════════════════════════════════════ */

const slides = [

  /* ── SLIDE 1: HOOK ── */
  {
    filename: "c01-hook.webp",
    label: "c01-hook",
    ratio: "1:1",
    ref: true,
    prompt: `${CHAR_RULES}
${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO SLIDE (quadrado 1:1, carrossel Instagram):

PERSONAGEM: mascote chibi à DIREITA do frame (30% da largura direita), pose pensativa, braço cruzado, mão no queixo, expressão de dúvida. Rim light vermelho intenso vindo da direita.

TEXTO à ESQUERDA (60% esquerdo, fundo escuro com gradiente):
- Linha pequena no topo esquerdo, letras maiúsculas, cinza claro, muito pequena:
  "PARA PROFESSORES DE JIU-JITSU INFANTIL"
- Traço vermelho curto horizontal abaixo
- Texto principal grande, bold condensado, branco, 3 linhas:
  "Você sempre"
  "IMPROVISA" (em vermelho #D42B1C, maior)
  "na aula?"
- Texto pequeno abaixo, cinza:
  "Existe uma forma melhor.  →"
- Rodapé direito discreto: "1 / 7"
- Canto superior direito discreto: "lipeexplica.com" em vermelho`
  },

  /* ── SLIDE 2: DOR ── */
  {
    filename: "c02-pain.webp",
    label: "c02-pain",
    ratio: "1:1",
    ref: false,
    prompt: `${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO SLIDE (quadrado 1:1, carrossel Instagram):
Fundo escuro tatame (#080808). SEM personagem.

TEXTO (ocupando toda a imagem, bem distribuído verticalmente):
- Topo, letras maiúsculas condensadas grandes, cinza escuro:
  "RECONHECE ALGUM DESSES?"
- Traço vermelho curto abaixo do título
- Lista de 5 itens com "✕" vermelho à esquerda de cada um, texto branco médio:
  ✕  Repete as mesmas brincadeiras toda semana
  ✕  As crianças perdem o foco no meio do treino
  ✕  Gasta horas planejando e ainda fica inseguro
  ✕  Improvisa na hora e percebe que não funcionou
  ✕  Alunos faltam — os pais não renovam a matrícula
- Linhas separadoras finas entre os itens (rgba branco 10%)
- Rodapé direito discreto: "2 / 7"
- Canto superior direito: "lipeexplica.com" vermelho discreto`
  },

  /* ── SLIDE 3: SOLUÇÃO ── */
  {
    filename: "c03-solution.webp",
    label: "c03-solution",
    ratio: "1:1",
    ref: true,
    prompt: `${CHAR_RULES}
${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO SLIDE (quadrado 1:1, carrossel Instagram):
Fundo: VERMELHO sólido (#D42B1C) como cor base.

PERSONAGEM: mascote chibi centralizado ligeiramente à direita, full body, segurando um livro aberto acima da cabeça com as duas mãos, sorriso enorme de vitória. Rim light dourado de cima.

TEXTO no lado esquerdo/inferior, sobreposto ao fundo vermelho:
- "50" muito grande, semi-transparente (rgba preto 20%), atrás do texto principal
- Pequeno texto acima: "A SOLUÇÃO QUE VOCÊ PRECISAVA" cinza escuro
- Texto principal bold condensado branco, 3 linhas grandes:
  "50 DINÂMICAS"
  "PRONTAS PRA"
  "APLICAR"
- Subtexto branco pequeno: "No celular. Na beira do tatame."
- Rodapé: "3 / 7" discreto escuro`
  },

  /* ── SLIDE 4: CATEGORIAS ── */
  {
    filename: "c04-categories.webp",
    label: "c04-categories",
    ratio: "1:1",
    ref: false,
    prompt: `${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO SLIDE (quadrado 1:1, carrossel Instagram):
Fundo escuro (#0d0d0d). SEM personagem.

TÍTULO no topo:
- "9 CATEGORIAS" em letras bold condensadas, cinza médio, grande
- Traço vermelho curto abaixo

GRID 3×3 de cards abaixo do título, cada card com borda sutil, fundo levemente cinza escuro, cantos arredondados:
Card 1: número grande vermelho "8" + texto branco "Aquecimento"
Card 2: "7" + "Jogos"
Card 3: "6" + "Coordenação"
Card 4: "6" + "Equipe"
Card 5: "5" + "Guarda"
Card 6: "5" + "Passagem"
Card 7: "5" + "Competição"
Card 8: "4" + "Disciplina" (dourado ao invés de vermelho)
Card 9: "4" + "Encerramento" (dourado)

- Rodapé direito: "4 / 7" discreto
- Canto superior direito: "lipeexplica.com" vermelho`
  },

  /* ── SLIDE 5: TRANSFORMAÇÃO ── */
  {
    filename: "c05-benefits.webp",
    label: "c05-benefits",
    ratio: "1:1",
    ref: false,
    prompt: `${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO SLIDE (quadrado 1:1, carrossel Instagram):
Fundo escuro (#080808). SEM personagem.

TÍTULO no topo:
- "O QUE MUDA EM 1 SEMANA" em letras bold condensadas, dourado (#C49419), grande
- Traço vermelho curto abaixo

3 BLOCOS de benefício, separados por linhas finas (branco 8%):

Bloco 1:
- Número/seta vermelha "→" grande à esquerda
- Título branco bold: "Plano a aula em 2 minutos"
- Subtexto cinza pequeno: "Abre no celular, escolhe a categoria, aplica. Sem planilha."

Bloco 2:
- "→" vermelho
- Título: "Turma engajada do início ao fim"
- Sub: "As crianças pedem as brincadeiras pelo nome e voltam toda semana."

Bloco 3:
- "→" vermelho
- Título: "Mais confiança em cada aula"
- Sub: "50 dinâmicas testadas. Você sabe exatamente o que vai acontecer."

- Rodapé direito: "5 / 7" discreto`
  },

  /* ── SLIDE 6: PROVA ── */
  {
    filename: "c06-proof.webp",
    label: "c06-proof",
    ratio: "1:1",
    ref: false,
    prompt: `${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO SLIDE (quadrado 1:1, carrossel Instagram):
Fundo escuro (#0d0d0d). SEM personagem.

SUBTÍTULO topo: "QUEM JÁ USA NO TATAME" cinza pequeno maiúsculas

3 MÉTRICAS lado a lado (linha horizontal), separadas por linhas verticais finas:
- Número grande vermelho "+127" + texto cinza "Professores"
- Número grande vermelho "+2.400" + texto cinza "Dinâmicas aplicadas"
- Número grande dourado "4,9★" + texto cinza "Avaliação média"

Linha dourada fina horizontal separando a seção de depoimento.

DEPOIMENTO (card com borda esquerda vermelha):
5 estrelas douradas ★★★★★
Texto branco itálico: "As crianças pedem as brincadeiras pelo nome e os pais já comentam a diferença."
Autoria maiúsculas cinza: "PROF. RAFAEL M. · FAIXA-PRETA · SP"

- Rodapé direito: "6 / 7" discreto`
  },

  /* ── SLIDE 7: CTA ── */
  {
    filename: "c07-cta.webp",
    label: "c07-cta",
    ratio: "1:1",
    ref: false,
    prompt: `${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO SLIDE (quadrado 1:1, carrossel Instagram):
Fundo escuro (#080808). SEM personagem.

CONTEÚDO centralizado verticalmente, alinhado à esquerda:

- Texto pequeno maiúsculas vermelho no topo: "OFERTA DE LANÇAMENTO"
- Traço vermelho curto
- Texto bold condensado branco, 3 linhas grandes:
  "50 DINÂMICAS"
  "PARA JIU-JITSU"
  "INFANTIL"
- Linha com preço antigo riscado cinza pequeno: "De R$29,90"
- Preço atual enorme dourado: "R$14,90"
- Texto cinza pequeno: "Acesso vitalício · 7 dias de garantia"
- Botão CTA: retângulo vermelho sólido arredondado com texto branco bold:
  "QUERO MEU ACESSO"
  abaixo do texto do botão, menor, branco translúcido:
  "lipeexplica.com/50dinamicas"

- Rodapé direito: "7 / 7" discreto`
  },
];

/* ══════════════════════════════════════════
   STORIES — 3 slides 9:16
══════════════════════════════════════════ */

const stories = [

  /* ── STORY 1: HOOK ── */
  {
    filename: "s01-hook.webp",
    label: "s01-hook",
    ratio: "9:16",
    ref: true,
    prompt: `${CHAR_RULES}
${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO STORY (vertical 9:16, Stories do Instagram):

PERSONAGEM: mascote chibi centralizado na parte inferior da imagem (metade inferior), surpreso, olhos arregalados, boca aberta, uma mão na altura da cabeça, rim light vermelho bilateral intenso.

TEXTO na metade superior e inferior da imagem:

Topo da imagem (sobre área escura):
- Pequeno texto maiúsculas vermelho: "PARA PROFESSORES DE JIU-JITSU INFANTIL"
- Texto grande bold condensado branco, 2 linhas:
  "Sem ideias pra"
  "aula de hoje?"
- Palavra "aula" em vermelho para ênfase

Parte inferior (abaixo do personagem, área escura):
- Texto cinza médio pequeno: "Improvisar cansa. Planejar demora."
- "As crianças estão perdendo o foco."
- Seta pra cima com texto cinza discreto: "↑ Arraste para cima"`
  },

  /* ── STORY 2: CONTEÚDO ── */
  {
    filename: "s02-content.webp",
    label: "s02-content",
    ratio: "9:16",
    ref: false,
    prompt: `${BRAND_STYLE}
${TEXT_RULES}

LAYOUT DO STORY (vertical 9:16, Stories do Instagram):
Fundo escuro (#0d0d0d). SEM personagem.

TOPO:
- Texto maiúsculas cinza pequeno: "O QUE VOCÊ RECEBE"
- Texto bold condensado branco e vermelho, 2 linhas:
  "50 DINÂMICAS"
  "em 9 categorias" (branco menor)

GRID 2×4 de cards (8 categorias), cada card:
- Fundo levemente cinza escuro, borda sutil, cantos arredondados
- 2 cards com borda vermelha sutil (destaque): "Aquecimento" e "Jogos"
Conteúdo de cada card:
  "8 Aquecimento" | "7 Jogos"
  "6 Coordenação" | "6 Equipe"
  "5 Guarda"      | "5 Passagem"
  "5 Competição"  | "4 Disciplina"
(número em vermelho grande + nome em branco)

RODAPÉ:
- "lipeexplica.com" cinza pequeno centralizado`
  },

  /* ── STORY 3: OFERTA ── */
  {
    filename: "s03-offer.webp",
    label: "s03-offer",
    ratio: "9:16",
    ref: false,
    prompt: `${TEXT_RULES}

LAYOUT DO STORY (vertical 9:16, Stories do Instagram):
Fundo: VERMELHO sólido intenso (#D42B1C). SEM personagem.
Gradiente escuro sutil no inferior para dar profundidade.

CONTEÚDO centralizado verticalmente:

- Texto muito pequeno maiúsculas escuro translúcido no topo:
  "OFERTA DE LANÇAMENTO"
- Preço antigo riscado, branco translúcido:
  "De R$29,90"
- Preço atual GIGANTE, branco:
  "R$14,90"
  (fonte muito grande, bold condensado, dominando o slide)
- Subtexto branco translúcido:
  "Acesso vitalício · Pagamento único"
- Botão CTA: retângulo escuro semitransparente arredondado:
  Linha 1 bold branco: "QUERO MEU ACESSO AGORA"
  Linha 2 menor branco translúcido: "lipeexplica.com/50dinamicas"
- Rodapé: check ✓ branco translúcido + "7 dias de garantia incondicional"`
  },
];

/* ══════════════════════════════════════════
   EXECUÇÃO
══════════════════════════════════════════ */

const allJobs = [...slides, ...stories];
console.log(`gerando ${allJobs.length} imagens finais com texto...`);

// Concorrência 2 (API rate limit)
const queue = [...allJobs];
await Promise.all(
  Array.from({ length: 2 }, async () => {
    while (queue.length) {
      const job = queue.shift();
      if (job) await generate(job.prompt, job.ratio, job.filename, job.label, job.ref);
    }
  })
);

console.log(`\nconcluído → public/social-final/`);
