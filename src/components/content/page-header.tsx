/** Faixa de abertura das páginas de conteúdo — visual original (dark + red). */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="grid-bg relative overflow-hidden border-b border-border px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 h-[360px] w-[360px] rounded-full bg-[#FF4D2D]/8 blur-[100px]"
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-[#FF4D2D]">
          {eyebrow}
        </p>
        <h1
          className="animate-fade-up mt-3 text-4xl font-black leading-tight text-foreground sm:text-5xl"
          style={{ animationDelay: "0.1s" }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="animate-fade-up mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "0.2s" }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
