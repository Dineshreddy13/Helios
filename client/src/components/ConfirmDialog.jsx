import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-800">
        <CardHeader className="mb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-2">{description}</CardDescription>}
        </CardHeader>
        <CardFooter className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-800/50">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={isDestructive ? 'destructive' : 'primary'} onClick={onConfirm} disabled={isLoading}>
            {confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmDialog;
