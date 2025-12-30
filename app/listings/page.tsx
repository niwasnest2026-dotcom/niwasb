import { Suspense } from 'react';
import ListingsContent from './ListingsContent';
import PropertiesDebugInfo from '@/components/PropertiesDebugInfo';

export default function ListingsPage() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite',
      minHeight: '100vh'
    }}>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <ListingsContent />
      </Suspense>
      
      {/* Temporary debug info - remove after fixing */}
      <PropertiesDebugInfo />
    </div>
  );
}
