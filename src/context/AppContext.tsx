
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { XsdNode, Mapping } from '@/types';

interface AppState {
  inputXml: string | null;
  responseXml: string | null;
  inputXsd: string | null;
  responseXsd: string | null;
  swaggerFile: string | null;
  sourceSchema: XsdNode | null;
  targetSchema: XsdNode | null;
  mappings: Mapping[];
}

interface AppContextType extends AppState {
  setState: (newState: Partial<AppState>) => void;
  resetState: () => void;
}

const initialState: AppState = {
  inputXml: null,
  responseXml: null,
  inputXsd: null,
  responseXsd: null,
  swaggerFile: null,
  sourceSchema: null,
  targetSchema: null,
  mappings: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateValue] = useState<AppState>(() => {
     if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (e) {
          console.error("Failed to parse state from localStorage", e);
          return initialState;
        }
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  const setState = (newState: Partial<AppState>) => {
    setStateValue(prev => ({ ...prev, ...newState }));
  };

  const resetState = () => {
    setStateValue(initialState);
    localStorage.removeItem('appState');
  };
  
  const contextValue = {
    ...state,
    setState,
    resetState,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
