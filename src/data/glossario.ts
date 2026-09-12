/** Glossário de Jiu-Jitsu (conteúdo portado do site original). */
export interface Termo {
  slug: string;
  nome: string;
  categoria:
    | "Cultura"
    | "Finalizações"
    | "Fundamentos"
    | "Guardas"
    | "Posições"
    | "Técnicas";
  descricao: string;
}

export const termos: Termo[] = [
  {
    slug: "oss",
    nome: "OSS",
    categoria: "Cultura",
    descricao:
      "Expressão japonesa de respeito usada nas artes marciais. No Jiu-Jitsu, é usada como saudação, confirmação e demonstração de respeito no tatame.",
  },
  {
    slug: "armbar",
    nome: "Armbar",
    categoria: "Finalizações",
    descricao:
      "Finalização que hiperextende o cotovelo do oponente. Uma das submissões mais fundamentais do Jiu-Jitsu, pode ser aplicada de diversas posições como guarda fechada, montada e costas.",
  },
  {
    slug: "kimura",
    nome: "Kimura",
    categoria: "Finalizações",
    descricao:
      "Chave de ombro que rotaciona o braço do oponente para trás. Nomeada em homenagem a Masahiko Kimura, judoca que derrotou Hélio Gracie em 1951 usando essa técnica.",
  },
  {
    slug: "omoplata",
    nome: "Omoplata",
    categoria: "Finalizações",
    descricao:
      "Finalização de ombro executada com as pernas. O praticante usa a perna para rotacionar o ombro do oponente, geralmente a partir da guarda.",
  },
  {
    slug: "rear-naked-choke",
    nome: "Rear Naked Choke",
    categoria: "Finalizações",
    descricao:
      "Estrangulamento aplicado pelas costas sem uso do kimono. Considerada uma das finalizações mais eficientes e universais do Jiu-Jitsu e MMA.",
  },
  {
    slug: "triangulo",
    nome: "Triângulo",
    categoria: "Finalizações",
    descricao:
      "Estrangulamento executado com as pernas, formando um triângulo ao redor do pescoço e braço do oponente. Pode ser aplicado da guarda, montada e outras posições.",
  },
  {
    slug: "faixa",
    nome: "Faixa",
    categoria: "Fundamentos",
    descricao:
      "Sistema de graduação do Jiu-Jitsu Brasileiro. As faixas adultas são: branca, azul, roxa, marrom e preta. Cada faixa representa um nível de conhecimento técnico e tempo de prática.",
  },
  {
    slug: "de-la-riva",
    nome: "De La Riva",
    categoria: "Guardas",
    descricao:
      "Tipo de guarda aberta onde o praticante engancha a perna do oponente com o pé por trás. Nomeada em homenagem a Ricardo De La Riva, que popularizou a posição nos anos 80.",
  },
  {
    slug: "guarda-fechada",
    nome: "Guarda Fechada",
    categoria: "Guardas",
    descricao:
      "Posição onde o praticante por baixo cruza os pés nas costas do oponente, controlando a distância e a postura. É a primeira guarda ensinada aos iniciantes.",
  },
  {
    slug: "meia-guarda",
    nome: "Meia-Guarda",
    categoria: "Guardas",
    descricao:
      "Posição intermediária onde o praticante por baixo controla apenas uma perna do oponente. Pode ser uma posição muito ofensiva com sweeps e entradas para as costas.",
  },
  {
    slug: "guarda",
    nome: "Guarda",
    categoria: "Posições",
    descricao:
      "Posição defensiva fundamental no Jiu-Jitsu onde o praticante usa as pernas para controlar o oponente que está por cima. Existem variações como guarda fechada, aberta, meia-guarda, De La Riva, entre outras.",
  },
  {
    slug: "montada",
    nome: "Montada",
    categoria: "Posições",
    descricao:
      "Posição dominante onde o praticante senta sobre o tronco do oponente. Oferece grande controle e acesso a diversas finalizações como armbar, ezekiel e estrangulamentos.",
  },
  {
    slug: "side-control",
    nome: "Side Control",
    categoria: "Posições",
    descricao:
      "Posição dominante lateral onde o praticante por cima está perpendicular ao oponente, controlando com pressão de quadril e ombro. Vale 3 pontos na passagem.",
  },
  {
    slug: "berimbolo",
    nome: "Berimbolo",
    categoria: "Técnicas",
    descricao:
      "Técnica de inversão criada no Jiu-Jitsu moderno que usa o quadril para inverter o oponente e chegar às costas. Popularizada por competidores como os irmãos Miyao e Mendes.",
  },
  {
    slug: "passagem",
    nome: "Passagem de Guarda",
    categoria: "Técnicas",
    descricao:
      "Ação de ultrapassar as pernas do oponente para chegar a uma posição dominante como side control, montada ou norte-sul.",
  },
  {
    slug: "raspagem",
    nome: "Raspagem",
    categoria: "Técnicas",
    descricao:
      "Técnica de reverter a posição a partir da guarda, passando de baixo para cima. Chamada de 'sweep' em inglês. Vale 2 pontos em competição.",
  },
];

export const categoriasGlossario = [
  "Cultura",
  "Finalizações",
  "Fundamentos",
  "Guardas",
  "Posições",
  "Técnicas",
] as const;
