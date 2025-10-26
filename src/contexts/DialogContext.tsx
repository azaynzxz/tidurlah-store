import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DialogContextType {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <DialogContext.Provider value={{ isDialogOpen, setIsDialogOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
