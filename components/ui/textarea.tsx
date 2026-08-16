import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-[#6CBD45] focus:ring-1 focus:ring-[#6CBD45]/30 flex min-h-20 w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
