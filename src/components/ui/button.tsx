import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botão base do design system.
 *
 * Variantes:
 *   primary    CTA da marca (vermelho #FF4B2B)
 *   secondary  ação secundária — superfície elevada
 *   ghost      ação terciária — sem contorno até o hover
 *   outline    contorno discreto sobre fundo escuro
 *   danger     ação destrutiva / estado de erro
 *   gold       EXCLUSIVO do produto "50 Dinâmicas" (usado pelo BuyButton).
 *              Não usar na Home nem nas páginas de conteúdo.
 *
 * `default` e `royal` são aliases legados de `primary`, mantidos porque
 * chamadas antigas os utilizam.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-semibold tracking-tight",
    "transition-[background-color,border-color,color,transform,opacity] duration-200 ease-[var(--ease)]",
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-45",
    // foco: herda o :focus-visible global, mas reforça o offset em superfícies escuras
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[var(--shadow-brand)] hover:bg-[color-mix(in_oklab,var(--brand)_88%,white_12%)]",
        default:
          "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[var(--shadow-brand)] hover:bg-[color-mix(in_oklab,var(--brand)_88%,white_12%)]",
        royal:
          "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[var(--shadow-brand)] hover:bg-[color-mix(in_oklab,var(--brand)_88%,white_12%)]",
        secondary:
          "bg-[var(--surface-2)] text-foreground border border-border hover:border-[color-mix(in_oklab,var(--foreground)_22%,transparent)] hover:bg-[color-mix(in_oklab,var(--surface-2)_88%,var(--foreground)_12%)]",
        outline:
          "border border-border bg-transparent text-foreground hover:border-[color-mix(in_oklab,var(--foreground)_22%,transparent)] hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)] hover:text-foreground",
        danger:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
        destructive:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
        gold: "bg-[var(--gold)] text-[var(--gold-foreground)] shadow-[0_18px_50px_-18px_color-mix(in_oklab,var(--gold)_60%,transparent)] hover:brightness-110",
      },
      size: {
        /** alvo de toque mínimo de 48px — padrão do site */
        default: "min-h-12 px-6 text-small",
        sm: "min-h-11 px-4 text-caption",
        lg: "min-h-14 px-8 text-body",
        /** uppercase largo — CTAs de destaque */
        cta: "min-h-14 px-9 text-caption font-bold uppercase tracking-[0.1em]",
        icon: "h-12 w-12 p-0",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
