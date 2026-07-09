import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'

export const Dropdown = DropdownMenuPrimitive.Root
export const DropdownTrigger = DropdownMenuPrimitive.Trigger
export const DropdownGroup = DropdownMenuPrimitive.Group
export const DropdownSub = DropdownMenuPrimitive.Sub
export const DropdownRadioGroup = DropdownMenuPrimitive.RadioGroup

export function DropdownContent({ className = '', sideOffset = 6, align = 'end', children, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={`z-[1000] min-w-[180px] overflow-hidden rounded-xl border border-border/60 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md animate-scale-in ${className}`}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownItem({ className = '', inset = false, danger = false, children, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={`flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium outline-none transition-colors data-[highlighted]:bg-surface-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-40 ${
        danger ? 'text-danger data-[highlighted]:bg-danger-soft' : 'text-ink'
      } ${inset ? 'pl-8' : ''} ${className}`}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
}

export function DropdownCheckboxItem({ className = '', children, checked, ...props }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-8 pr-2.5 text-[13px] font-medium text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted ${className}`}
      {...props}
    >
      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check size={13} className="text-primary" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownRadioItem({ className = '', children, ...props }) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-8 pr-2.5 text-[13px] font-medium text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted ${className}`}
      {...props}
    >
      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle size={7} className="fill-primary text-primary" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export function DropdownLabel({ className = '', ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted ${className}`}
      {...props}
    />
  )
}

export function DropdownSeparator({ className = '', ...props }) {
  return <DropdownMenuPrimitive.Separator className={`my-1.5 h-px bg-border/60 ${className}`} {...props} />
}

export function DropdownSubTrigger({ className = '', children, ...props }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={`flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted data-[state=open]:bg-surface-muted ${className}`}
      {...props}
    >
      {children}
      <ChevronRight size={13} className="ml-auto text-muted" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

export function DropdownSubContent({ className = '', ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        className={`z-[1000] min-w-[180px] overflow-hidden rounded-xl border border-border/60 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md animate-scale-in ${className}`}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}