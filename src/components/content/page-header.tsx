import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";

/** Faixa de abertura das páginas de conteúdo. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  breadcrumb?: Crumb[];
}) {
  return (
    <section className="grid-bg relative overflow-hidden border-b border-border px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 h-[360px] w-[360px] rounded-full bg-[color-mix(in_oklab,var(--brand)_10%,transparent)] blur-[100px]"
      />

      <div className="relative mx-auto max-w-6xl">
        {breadcrumb?.length ? (
          <Breadcrumb items={breadcrumb} className="mb-6" />
        ) : null}

        <p className="animate-fade-up text-label text-[var(--brand)]">{eyebrow}</p>

        <h1
          className="animate-fade-up mt-3 text-h1 text-foreground"
          style={{ animationDelay: "0.1s" }}
        >
          {title}
        </h1>

        {subtitle ? (
          <p
            className="animate-fade-up measure mt-4 text-body-lg text-muted-foreground"
            style={{ animationDelay: "0.2s" }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
