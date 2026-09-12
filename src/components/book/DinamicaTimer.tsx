"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";

/** Extrai minutos de strings como "10 minutos" / "8 min". */
function parseMinutes(tempo: string): number {
  const m = tempo.match(/(\d+)/);
  return m ? Number(m[1]) : 5;
}

/**
 * Cronômetro da dinâmica — para o professor usar na beira do tatame.
 * Contagem regressiva a partir do tempo sugerido, com pulso visual no fim.
 */
export function DinamicaTimer({ tempo, dinamicaId }: { tempo: string; dinamicaId: number }) {
  const total = parseMinutes(tempo) * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  // reset ao trocar de dinâmica
  useEffect(() => {
    setLeft(total);
    setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dinamicaId, total]);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = total > 0 ? ((total - left) / total) * 100 : 0;
  const done = left === 0;

  return (
    <div
      className={`rounded-2xl border p-3 transition sm:p-4 ${
        done
          ? "animate-pulse border-[#FF4D2D] bg-[#FF4D2D]/15"
          : "border-border bg-card/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <TimerReset className="h-3.5 w-3.5" />
          Cronômetro · {tempo}
        </div>
        <p
          className={`font-mono text-2xl font-bold tabular-nums ${
            done ? "text-[#FF4D2D]" : "text-foreground"
          }`}
        >
          {done ? "FIM!" : `${mm}:${ss}`}
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #FF4D2D, #ffbc7c)",
          }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => (done ? (setLeft(total), setRunning(true)) : setRunning(!running))}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FF4D2D] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:brightness-110"
        >
          {running ? (
            <>
              <Pause className="h-3.5 w-3.5" /> Pausar
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" /> {done ? "De novo" : "Iniciar"}
            </>
          )}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setLeft(total);
          }}
          aria-label="Reiniciar cronômetro"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
