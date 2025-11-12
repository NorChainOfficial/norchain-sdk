'use client';

import { useState } from 'react';
import { AISidebar } from './AISidebar';
import { MessageSquare } from 'lucide-react';

export function AISidebarProvider() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center z-40"
          aria-label="Open NorAI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
      <AISidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

