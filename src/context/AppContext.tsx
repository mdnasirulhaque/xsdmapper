
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { XsdNode, Mapping, MappingSets } from '@/types';

interface AppState {
  inputXml: string | null;
  responseXml: string | null;
  inputXsd: string | null;
  responseXsd: string | null;
  swaggerFile: string | null;
  endpoint: string | null;
  method: string | null;
  sourceSchema: XsdNode | null;
  targetSchema: XsdNode | null;
  mappings: MappingSets;
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
  endpoint: null,
  method: null,
  sourceSchema: null,
  targetSchema: null,
  mappings: {
    set1: [],
    set2: [],
    set3: [],
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateValue] = useState<AppState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load state from localStorage only on the client side, after the initial render.
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Basic validation to ensure the parsed state has the expected shape
        if (parsed && typeof parsed === 'object' && 'sourceSchema' in parsed && 'mappings' in parsed && 'set1' in parsed.mappings) {
          setStateValue(parsed);
        } else {
            // If the stored state is old, reset to initial
            localStorage.removeItem('appState');
            setStateValue(initialState);
        }
      } catch (e) {
        console.error("Failed to parse state from localStorage", e);
        setStateValue(initialState);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes, but only after it has been initialized.
    if (isInitialized) {
      localStorage.setItem('appState', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const setState = (newState: Partial<AppState>) => {
    setStateValue(prev => ({ ...prev, ...newState }));
  };

  const resetState = () => {
    setStateValue(initialState);
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

    