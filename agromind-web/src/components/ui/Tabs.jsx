import * as TabsPrimitive from '@radix-ui/react-tabs'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className = '', ...props }) {
  return (
    <TabsPrimitive.List
      className={`inline-flex items-center gap-1 rounded-xl border border-border/60 bg-surface-muted/60 p-1 ${className}`}
      {...props}
    />
  )
}

export function TabsTrigger({ className = '', ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-muted transition-all data-[state=active]:bg-primary-soft data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-ink ${className}`}
      {...props}
    />
  )
}

export function TabsContent({ className = '', ...props }) {
  return <TabsPrimitive.Content className={`mt-4 animate-fade-in outline-none ${className}`} {...props} />
}