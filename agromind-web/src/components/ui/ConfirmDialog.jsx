import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Primitives'

// Uso:
// const [open, setOpen] = useState(false)
// <ConfirmDialog
//   open={open}
//   onOpenChange={setOpen}
//   title="Excluir fazenda?"
//   description="Essa ação não pode ser desfeita. Todos os talhões e diagnósticos associados serão removidos."
//   confirmLabel="Excluir"
//   onConfirm={handleDelete}
// />
export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Tem certeza?',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  loading = false,
  onConfirm,
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[900] bg-black/60 backdrop-blur-sm animate-fade-in" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[901] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/60 bg-surface p-5 shadow-2xl animate-scale-in">
          <div className="flex gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
              }`}
            >
              <AlertTriangle size={17} />
            </span>
            <div className="flex-1">
              <AlertDialogPrimitive.Title className="text-sm font-bold text-ink">{title}</AlertDialogPrimitive.Title>
              {description && (
                <AlertDialogPrimitive.Description className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {description}
                </AlertDialogPrimitive.Description>
              )}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="secondary" size="sm">
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant={tone === 'danger' ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}