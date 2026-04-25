import { createContext, type ReactNode, useContext } from 'react';

export type OpenDocContextType = {
  openDoc: (docId: string) => void;
  closeDoc: () => void;
};

const OpenDocContext = createContext<OpenDocContextType | null>(null);

export const useOpenDocContext = () => {
  const context = useContext(OpenDocContext);
  if (!context) {
    throw new Error('useOpenDocContext must be used within a OpenDocProvider');
  }
  return context;
};

export interface OpenDocProviderProps {
  children: ReactNode;
  value: OpenDocContextType;
}

export const OpenDocProvider = ({ children, value }: OpenDocProviderProps) => {
  return (
    <OpenDocContext.Provider value={value}>{children}</OpenDocContext.Provider>
  );
};
