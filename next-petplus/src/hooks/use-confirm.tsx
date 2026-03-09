'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

let globalConfirm: ((message: string, options?: ConfirmOptions) => Promise<boolean>) | null = null;

export function ConfirmProvider() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    resolve: null,
    title: '',
    description: '',
  });

  globalConfirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        resolve,
        title: options?.title || 'Confirmar',
        description: message,
        confirmLabel: options?.confirmLabel || 'Confirmar',
        cancelLabel: options?.cancelLabel || 'Cancelar',
        variant: options?.variant || 'destructive',
      });
    });
  }, []);

  const handleResponse = (value: boolean) => {
    state.resolve?.(value);
    setState(s => ({ ...s, open: false, resolve: null }));
  };

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && handleResponse(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{state.description}</p>
        <div className="flex gap-3 mt-2 justify-end">
          <Button variant="outline" onClick={() => handleResponse(false)}>
            {state.cancelLabel}
          </Button>
          <Button
            variant={state.variant}
            onClick={() => handleResponse(true)}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirm() {
  const confirm = useCallback(
    (message: string, options?: ConfirmOptions): Promise<boolean> => {
      if (globalConfirm) return globalConfirm(message, options);
      // fallback para ambientes sem o provider
      return Promise.resolve(window.confirm(message));
    },
    []
  );
  return { confirm };
}