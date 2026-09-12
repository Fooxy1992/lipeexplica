import type { Categoria } from "@/types/book";

const palettes: Record<Categoria, [string, string, string]> = {
  Aquecimento: ["#F59E0B", "#FBBF24", "#1D4ED8"],
  Coordenação: ["#2563EB", "#60A5FA", "#F59E0B"],
  Jogos: ["#F59E0B", "#EF4444", "#2563EB"],
  Guarda: ["#1D4ED8", "#60A5FA", "#F59E0B"],
  Passagem: ["#2563EB", "#93C5FD", "#F59E0B"],
  Disciplina: ["#0F172A", "#2563EB", "#F59E0B"],
  Equipe: ["#2563EB", "#F59E0B", "#60A5FA"],
  Competição: ["#EF4444", "#F59E0B", "#2563EB"],
  Encerramento: ["#60A5FA", "#F59E0B", "#0F172A"],
};

export function BookIllustration({
  categoria,
  className = "",
}: {
  categoria: Categoria;
  className?: string;
}) {
  const [c1, c2, c3] = palettes[categoria];
  return (
    <svg
      viewBox="0 0 240 160"
      className={className}
      role="img"
      aria-label={`Ilustração da categoria ${categoria}`}
    >
      <defs>
        <linearGradient id={`bg-${categoria}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c2} stopOpacity="0.18" />
          <stop offset="1" stopColor={c1} stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="232"
        height="152"
        rx="18"
        fill={`url(#bg-${categoria})`}
      />
      {/* tatame lines */}
      <g stroke={c1} strokeOpacity="0.25" strokeWidth="1.2">
        <line x1="20" y1="130" x2="220" y2="130" />
        <line x1="20" y1="140" x2="220" y2="140" />
      </g>
      {/* Little kimono kid */}
      <g transform="translate(80,40)">
        {/* head */}
        <circle cx="40" cy="18" r="14" fill="#F3D6B3" />
        <path d="M26 14 Q40 -2 54 14 L52 20 Q40 12 28 20 Z" fill="#0F172A" />
        {/* body / kimono */}
        <path
          d="M14 82 L20 42 Q40 30 60 42 L66 82 Z"
          fill="#ffffff"
          stroke="#0F172A"
          strokeWidth="1.2"
        />
        <path d="M40 32 L40 82" stroke="#0F172A" strokeWidth="1.2" />
        {/* belt */}
        <rect x="16" y="70" width="48" height="8" rx="2" fill={c1} />
        <rect x="60" y="70" width="6" height="8" fill={c3} />
        {/* arms */}
        <path d="M20 44 L4 66" stroke="#F3D6B3" strokeWidth="7" strokeLinecap="round" />
        <path d="M60 44 L76 66" stroke="#F3D6B3" strokeWidth="7" strokeLinecap="round" />
      </g>
      {/* second small kid */}
      <g transform="translate(30,70)" opacity="0.85">
        <circle cx="20" cy="14" r="10" fill="#F3D6B3" />
        <path d="M10 12 Q20 2 30 12 L28 16 Q20 10 12 16 Z" fill="#0F172A" />
        <path
          d="M4 56 L8 30 Q20 22 32 30 L36 56 Z"
          fill="#ffffff"
          stroke="#0F172A"
          strokeWidth="1"
        />
        <rect x="6" y="46" width="28" height="6" rx="2" fill={c2} />
      </g>
      {/* stars */}
      <g fill={c3}>
        <circle cx="200" cy="30" r="3" />
        <circle cx="215" cy="50" r="2" />
        <circle cx="190" cy="55" r="2" />
      </g>
    </svg>
  );
}
