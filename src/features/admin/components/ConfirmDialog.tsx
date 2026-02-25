import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/ui/alert-dialog";

type Props = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const ConfirmDialog = ({ title, description, confirmLabel = "Confirmer", cancelLabel = "Annuler", onConfirm, open, onOpenChange, children }: Props) => {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm} disabled={loading}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children != null ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
      {content}
    </AlertDialog>
  );
};

export default ConfirmDialog;
