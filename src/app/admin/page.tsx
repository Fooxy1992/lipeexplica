import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { userScopedContainer } from "@/infrastructure/di/container";
import { formatDate } from "@/lib/utils";
import {
  DashboardStats,
  DashboardStatsSkeleton,
  SalesTable,
  SalesTableSkeleton,
  ActivitySidebar,
  ActivitySidebarSkeleton,
} from "./_components/dashboard-widgets";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const c = await userScopedContainer();
  const {
    data: { user },
  } = await c.db.auth.getUser();
  const profile = user ? await c.profiles.findById(user.id) : null;
  const firstName = profile?.name?.split(" ")[0] ?? "Admin";

  const now = new Date();
  const dateLabel = now.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-full gap-6">
      {/* ── Center content ── */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C1E2E] sm:text-3xl">
              Olá, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-[#8B92A8]">
              Atualizado em {formatDate(now)}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#E4EAF4] bg-white px-4 py-2.5 text-sm font-medium text-[#1C1E2E] shadow-sm">
            <Calendar className="h-4 w-4 text-[#8B92A8]" />
            {dateLabel}
          </div>
        </div>

        {/* Stat cards */}
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        {/* Sales table */}
        <Suspense fallback={<SalesTableSkeleton />}>
          <SalesTable />
        </Suspense>
      </div>

      {/* ── Right sidebar (xl+) ── */}
      <aside className="hidden w-[272px] shrink-0 xl:block">
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <ActivitySidebar />
        </Suspense>
      </aside>
    </div>
  );
}
