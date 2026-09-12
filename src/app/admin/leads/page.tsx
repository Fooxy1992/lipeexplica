import { adminContainer } from "@/infrastructure/di/container";
import { deleteLead } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface LeadRow {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  source: string;
  message: string | null;
  created_at: string;
}

const sourceStyles: Record<string, string> = {
  newsletter: "bg-blue-500/10 text-blue-600",
  contato: "bg-emerald-500/10 text-emerald-600",
  checkout: "bg-amber-500/10 text-amber-600",
  outro: "bg-zinc-500/10 text-zinc-500",
};

/** LEADS capturados (newsletter + formulário de contato). */
export default async function AdminLeadsPage() {
  const c = adminContainer();
  const { data, error } = await c.db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)
    .returns<LeadRow[]>();
  if (error) throw error;

  const leads = data ?? [];
  const emailsCsv = leads.map((l) => l.email).join(",");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Leads</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {leads.length} lead(s) capturados via newsletter e contato.
          </p>
        </div>
        {leads.length > 0 ? (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(
              "email,nome,telefone,origem,data\n" +
                leads
                  .map(
                    (l) =>
                      `${l.email},${l.name ?? ""},${l.phone ?? ""},${l.source},${l.created_at}`,
                  )
                  .join("\n"),
            )}`}
            download="leads-lipeexplica.csv"
            className="rounded-full bg-[var(--royal)] px-5 py-2.5 text-xs font-semibold text-[var(--royal-foreground)] transition hover:opacity-90"
          >
            Exportar CSV
          </a>
        ) : null}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Mensagem</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-border/60 last:border-0">
                <td className="whitespace-nowrap px-4 py-3">{formatDate(l.created_at)}</td>
                <td className="px-4 py-3 font-medium">{l.email}</td>
                <td className="px-4 py-3">{l.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sourceStyles[l.source] ?? ""}`}
                  >
                    {l.source}
                  </span>
                </td>
                <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground" title={l.message ?? ""}>
                  {l.message ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteLead}>
                    <input type="hidden" name="leadId" value={l.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Nenhum lead ainda. Eles chegam pela newsletter da home e pelo
                  formulário de contato.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
