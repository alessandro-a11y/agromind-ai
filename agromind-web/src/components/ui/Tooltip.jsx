import * as TooltipPrimitive from '@radix-ui/react-tooltip'

// Envolva a árvore da aplicação uma única vez com <TooltipProvider> (ex.: main.jsx)
export const TooltipProvider = TooltipPrimitive.Provider

export function Tooltip({ content, children, side = 'top', delay = 300 }) {
  if (!content) return children

  return (
    <TooltipPrimitive.Root delayDuration={delay}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-[1100] max-w-[220px] rounded-lg border border-border/60 bg-surface px-2.5 py-1.5 text-[11.5px] font-medium text-ink shadow-xl animate-fade-in"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-surface" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}