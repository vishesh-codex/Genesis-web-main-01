import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45]/30 flex h-10 w-full min-w-0 rounded-xl border px-3.5 py-2 text-sm shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
