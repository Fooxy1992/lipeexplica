import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Library } from "lucide-react";
import { userScopedContainer } from "@/infrastructure/di/container";
import { SidebarNav, MobileTopNav } from "@/components/admin/sidebar-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await userScopedContainer();
  const {
    data: { user },
  } = await c.db.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const profile = await c.profiles.findById(user.id);
  if (!profile?.isAdmin) redirect("/library");

  return (
    <>
      <style>{`
        @view-transition { navigation: auto; }
        @keyframes admin-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::view-transition-old(root) {
          animation: 150ms ease-in both fade-out;
        }
        ::view-transition-new(root) {
          animation: 200ms ease-out both admin-slide-in;
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>
    <div className="flex h-dvh overflow-hidden bg-[#EEF2FA]">
      {/* ── Fixed left sidebar (desktop) ── */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[#E4EAF4] bg-white lg:flex">
        {/* Brand */}
        <div className="px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #FF4D2D, #ff7a5c)" }}
            >
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1E2E]">LipeExplica</p>
              <p className="text-[10px] text-[#8B92A8]">Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <SidebarNav />
        </nav>

        {/* Footer */}
        <div className="border-t border-[#E4EAF4] px-3 pb-5 pt-3">
          <Link
            href="/library"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#8B92A8] transition-colors hover:bg-[#F5F7FF] hover:text-[#1C1E2E]"
          >
            <Library className="h-4 w-4 shrink-0" />
            Ir para Biblioteca
          </Link>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="border-b border-[#E4EAF4] bg-white lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/" className="font-bold text-[#1C1E2E]">
              Lipe<span style={{ color: "#FF4D2D" }}>Explica</span>
              <span className="ml-2 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#FF4D2D]">
                admin
              </span>
            </Link>
          </div>
          <MobileTopNav />
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
    </>
  );
}
