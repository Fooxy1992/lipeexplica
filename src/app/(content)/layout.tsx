import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { SkipLink } from "@/components/ui/skip-link";

export const dynamic = "force-dynamic";

/** Layout das páginas de conteúdo do canal (vídeos, blog, glossário, sobre, contato). */
export default async function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="site-dark min-h-dvh">
      <SkipLink />
      <Navbar isLoggedIn={Boolean(user)} />
      <main id="conteudo" className="min-h-[60dvh]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
