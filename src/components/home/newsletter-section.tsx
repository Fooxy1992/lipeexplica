import { NewsletterForm } from "@/components/marketing/lead-forms";

/** Captura de email no fim da Home. */
export function NewsletterSection() {
  return (
    <section
      aria-labelledby="home-newsletter"
      className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8"
    >
      <div className="rounded-3xl border border-border bg-[var(--surface-1)] px-6 py-14 text-center sm:px-12">
        <h2 id="home-newsletter" className="text-h2 text-foreground">
          Receba os próximos conteúdos
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-body text-muted-foreground">
          Artigos, termos do glossário e análises sobre Jiu-Jitsu direto no seu
          email.
        </p>

        <NewsletterForm />
      </div>
    </section>
  );
}
