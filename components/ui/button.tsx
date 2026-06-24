import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-night text-white shadow-sm hover:bg-night/90",
        variant === "secondary" && "border border-gold/70 bg-white text-night hover:bg-gold/10",
        variant === "ghost" && "bg-transparent text-night hover:bg-gold/10",
        variant === "danger" && "bg-destructive text-white hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}
