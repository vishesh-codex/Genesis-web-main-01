import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out transform-gpu disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#6CBD45]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#5ba83a] text-white shadow-[0_8px_20px_-4px_rgba(108,189,69,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_20px_-4px_rgba(108,189,69,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/30 dark:border-white/20 backdrop-blur-xl hover:shadow-[0_12px_24px_-4px_rgba(108,189,69,0.5),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-95",
        primary:
          "bg-gradient-to-r from-[#6CBD45] via-emerald-500 to-[#5ba83a] text-white shadow-[0_8px_20px_-4px_rgba(108,189,69,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_20px_-4px_rgba(108,189,69,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/30 dark:border-white/20 backdrop-blur-xl hover:shadow-[0_12px_24px_-4px_rgba(108,189,69,0.5),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-95",
        outline:
          "border border-slate-300/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl text-slate-800 dark:text-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/90 dark:hover:bg-slate-800/90 hover:border-[#6CBD45]/60 dark:hover:border-[#6CBD45]/60 hover:text-[#6CBD45] dark:hover:text-[#6CBD45] hover:shadow-[0_8px_20px_rgba(108,189,69,0.15)]",
        destructive:
          "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-[0_8px_20px_-4px_rgba(225,29,72,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/20 backdrop-blur-xl hover:shadow-[0_12px_24px_-4px_rgba(225,29,72,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-110 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        secondary:
          "bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:shadow-md",
        ghost:
          "hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md",
        link: "text-primary underline-offset-4 hover:underline hover:translate-y-0 active:scale-100",
        glass:
          "bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/15 text-slate-900 dark:text-white shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:bg-white/30 dark:hover:bg-white/20 hover:shadow-xl",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4 text-sm",
        sm: "h-8 px-3.5 py-1.5 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-7 py-3 text-base has-[>svg]:px-5",
        full: "h-11 px-6 py-2.5 rounded-full text-sm has-[>svg]:px-4",
        icon: "size-10",
      },
      shape: {
        default: "rounded-2xl",
        full: "rounded-full",
        xl: "rounded-xl",
        lg: "rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

