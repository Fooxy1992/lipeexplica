import { Fragment } from "react";

/**
 * Renderizador markdown mínimo para o conteúdo editorial do site
 * (##/### títulos, - listas, | tabelas |, **negrito**, parágrafos).
 * Sem dependências e sem HTML arbitrário — conteúdo é confiável (repo),
 * mas ainda assim nunca usamos dangerouslySetInnerHTML.
 */

function inline(text: string, key = 0): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return (
    <Fragment key={key}>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>,
      )}
    </Fragment>
  );
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n\n+/);

  return (
    <div className="space-y-5">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter(Boolean);
        if (lines.length === 0) return null;
        const first = lines[0] ?? "";

        if (first.startsWith("### ")) {
          return (
            <h3 key={bi} className="pt-2 font-display text-xl font-semibold">
              {inline(first.slice(4))}
            </h3>
          );
        }
        if (first.startsWith("## ")) {
          return (
            <h2 key={bi} className="pt-4 font-display text-2xl font-semibold">
              {inline(first.slice(3))}
            </h2>
          );
        }
        if (first.startsWith("- ")) {
          return (
            <ul key={bi} className="list-disc space-y-2 pl-5 text-foreground/85">
              {lines.map((l, i) => (
                <li key={i} className="leading-relaxed">
                  {inline(l.replace(/^- /, ""))}
                </li>
              ))}
            </ul>
          );
        }
        if (first.startsWith("|")) {
          const rows = lines
            .filter((l) => !/^\|[\s|:-]+\|$/.test(l))
            .map((l) =>
              l
                .split("|")
                .slice(1, -1)
                .map((c) => c.trim()),
            );
          const [head, ...body] = rows;
          return (
            <div key={bi} className="overflow-x-auto">
              <table className="w-full min-w-[320px] overflow-hidden rounded-xl border border-border text-sm">
                <thead className="bg-secondary text-left">
                  <tr>
                    {(head ?? []).map((h, i) => (
                      <th key={i} className="px-4 py-2.5 font-semibold">
                        {inline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((r, ri) => (
                    <tr key={ri} className="border-t border-border">
                      {r.map((c, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-foreground/85">
                          {inline(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={bi} className="leading-relaxed text-foreground/85">
            {lines.map((l, i) => inline(l, i))}
          </p>
        );
      })}
    </div>
  );
}
