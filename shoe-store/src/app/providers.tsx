'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: '!bg-[var(--color-surface)] !text-[var(--color-text)] !border !border-[var(--color-border)] !shadow-xl',
            title: '!font-bold !font-[var(--font-heading)]',
            description: '!text-[var(--color-text-muted)]',
            actionButton: '!bg-primary-600 !text-white',
          },
        }}
        richColors
        closeButton
      />
    </QueryClientProvider>
  );
}
