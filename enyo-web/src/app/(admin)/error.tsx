'use client';

import { Button } from '@/components/ui/button';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-2">Admin Error</h2>
      <p className="text-muted-foreground mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
