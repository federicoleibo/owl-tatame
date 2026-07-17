import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold tracking-wide transition-all duration-150 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  const variants: Record<string, string> = {
    primary: "bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80",
    secondary: "bg-surface-alt text-foreground border border-border hover:bg-surface-alt/70",
    danger: "bg-destructive text-white hover:bg-destructive/90",
    ghost: "bg-transparent text-foreground hover:bg-surface-alt",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full min-h-[44px] rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-sm font-medium text-muted mb-1.5 ${className}`} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 ${className}`}>{children}</div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" | "success" | "danger" }) {
  const tones: Record<string, string> = {
    muted: "bg-surface-alt text-muted",
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    danger: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-sm text-destructive mt-1">
      {children}
    </p>
  );
}
