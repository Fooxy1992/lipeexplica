"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const fieldBase = [
  "w-full rounded-xl border border-border bg-[var(--surface-2)]",
  "px-4 py-3 text-body text-foreground",
  "placeholder:text-[color-mix(in_oklab,var(--muted-foreground)_75%,transparent)]",
  "transition-[border-color,background-color] duration-200 ease-[var(--ease)]",
  "hover:border-[color-mix(in_oklab,var(--foreground)_18%,transparent)]",
  "focus:border-[var(--brand)] focus:outline-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-[invalid=true]:border-[var(--destructive)]",
].join(" ");

interface FieldShellProps {
  label: string;
  /** esconde o rótulo visualmente, mantendo-o para leitores de tela */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}

function FieldShell({
  label,
  hideLabel,
  hint,
  error,
  id,
  children,
}: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn(
          "text-caption font-medium text-muted-foreground",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-caption text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="text-caption text-[var(--destructive)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
}

/** Campo de texto com rótulo sempre presente (visível ou para leitor de tela). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hideLabel, hint, error, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;

    return (
      <FieldShell
        label={label}
        hideLabel={hideLabel}
        hint={hint}
        error={error}
        id={fieldId}
      >
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          className={cn(fieldBase, className)}
          {...props}
        />
      </FieldShell>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hideLabel, hint, error, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;

    return (
      <FieldShell
        label={label}
        hideLabel={hideLabel}
        hint={hint}
        error={error}
        id={fieldId}
      >
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          className={cn(fieldBase, "resize-none", className)}
          {...props}
        />
      </FieldShell>
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hideLabel, hint, error, id, children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;

    return (
      <FieldShell
        label={label}
        hideLabel={hideLabel}
        hint={hint}
        error={error}
        id={fieldId}
      >
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          className={cn(fieldBase, "appearance-none pr-10", className)}
          {...props}
        >
          {children}
        </select>
      </FieldShell>
    );
  },
);
Select.displayName = "Select";
