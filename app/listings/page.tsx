import { Suspense } from 'react';
import ListingsContent from './ListingsContent';

export default function ListingsPage() {
  return (
    <div className="bg-neutral-50">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <ListingsContent />
      </Suspense>
    </div>
  );
}
