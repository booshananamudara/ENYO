'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Floating live chat button and panel placeholder. */
export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 rounded-lg border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold">Support Chat</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center h-64 p-4 text-center text-muted-foreground">
            <p className="text-sm">AI-powered support coming soon. For now, please use the contact form.</p>
          </div>
        </div>
      )}
      <Button
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </>
  );
}
