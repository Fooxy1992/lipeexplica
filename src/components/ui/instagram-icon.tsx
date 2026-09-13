import { cn } from "@/lib/utils";

/**
 * Ícone do Instagram em SVG inline.
 * O lucide-react não distribui mais ícones de marca, e não vale adicionar uma
 * dependência inteira por um glifo.
 */
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={cn("h-5 w-5", className)}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
