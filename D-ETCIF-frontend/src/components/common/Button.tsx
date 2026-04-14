// Package common
// D-ETCIF-frontend/src/components/common/Button.tsx
import React from "react";
import { cn } from "@/utils/cn";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost";
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  className = "",
  loading = false,
  children,
  ...props
}: Props) {
  const base =
    "px-4 py-2 rounded text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";

  const style = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "hover:bg-gray-100",
  };

  return (
    <button
      className={cn(base, style[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
