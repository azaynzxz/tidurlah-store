import { createContext, useContext, useState, ReactNode } from 'react';

interface PromoBannerContextType {
  isBannerVisible: boolean;
  setBannerVisible: (visible: boolean) => void;
}

const PromoBannerContext = createContext<PromoBannerContextType | undefined>(undefined);

export const PromoBannerProvider = ({ children }: { children: ReactNode }) => {
  const [isBannerVisible, setBannerVisible] = useState(true);

  return (
    <PromoBannerContext.Provider value={{ isBannerVisible, setBannerVisible }}>
      {children}
    </PromoBannerContext.Provider>
  );
};

export const usePromoBanner = () => {
  const context = useContext(PromoBannerContext);
  if (context === undefined) {
    throw new Error('usePromoBanner must be used within a PromoBannerProvider');
  }
  return context;
};

