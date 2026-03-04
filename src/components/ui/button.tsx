import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[15px] font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg:not([class*='size-'])]:size-[18px] hover:[&_svg:last-child]:translate-x-0.5 outline-none focus-visible:outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive sm:text-base",
  {
    variants: {
      variant: {
        default:
          "text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-[0_18px_40px_-18px_rgba(59,130,246,0.75)] hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-22px_rgba(59,130,246,0.95)] active:translate-y-0 active:shadow-[0_14px_30px_-20px_rgba(59,130,246,0.55)] focus-visible:ring-4 focus-visible:ring-[rgba(59,130,246,0.28)]",
        destructive:
          "bg-destructive text-white shadow-[0_16px_36px_-20px_rgba(220,38,38,0.5)] hover:-translate-y-[1px] hover:bg-destructive/90 focus-visible:ring-4 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-slate-200 bg-white/75 text-slate-900 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.35)] backdrop-blur hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white active:translate-y-0 active:shadow-[0_10px_24px_-22px_rgba(15,23,42,0.22)] focus-visible:ring-4 focus-visible:ring-[rgba(15,23,42,0.12)] dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-slate-900 text-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.45)] hover:-translate-y-[1px] hover:bg-slate-800 active:translate-y-0 focus-visible:ring-4 focus-visible:ring-[rgba(15,23,42,0.18)]",
        ghost:
          "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-[rgba(15,23,42,0.08)] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-0",
      },
      size: {
        default: "h-11 px-5 py-3 has-[>svg]:px-4",
        xs: "h-8 gap-1 rounded-xl px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-10 gap-1.5 px-4 py-2.5 has-[>svg]:px-3",
        lg: "h-12 px-7 py-4 has-[>svg]:px-5",
        icon: "size-11 rounded-2xl",
        "icon-xs": "size-8 rounded-xl [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-10 rounded-2xl",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
