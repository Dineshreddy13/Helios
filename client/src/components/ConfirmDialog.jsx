import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  description, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDestructive = false,
  isLoading = false 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) {
        onCancel();
      }
    }}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={isDestructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={isLoading}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
