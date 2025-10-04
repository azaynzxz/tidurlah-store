import React from 'react';
import { POSDashboard } from '@/components/pos/POSDashboard';
import { toast } from 'sonner';

const Cashier = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <POSDashboard />
    </div>
  );
};

export default Cashier;
