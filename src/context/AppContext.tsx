
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { XsdNode, MappingSets, SchemasBySet } from '@/types';
import { Loader } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AppState {
  soeid: string | null;
  inputXml: string | null;
  responseXml: string | null;
  inputXsd: string | null;
  responseXsd: string | null;
  swaggerFile: string | null;
  endpoint: string | null;
  method: string | null;
  sourceSchemas: SchemasBySet;
  targetSchemas: SchemasBySet;
  mappings: MappingSets;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setState: (newState: Partial<AppState>) => void;
  resetState: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

const initialState: AppState = {
  soeid: 'MH85983',
  inputXml: null,
  responseXml: null,
  inputXsd: null,
  responseXsd: null,
  swaggerFile: null,
  endpoint: null,
  method: null,
  sourceSchemas: {
    set1: null,
    set2: null,
    set3: null,
  },
  targetSchemas: {
    set1: null,
    set2: null,
    set3: null,
  },
  mappings: {
    set1: [],
    set2: [],
    set3: [],
  },
  isLoading: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateValue] = useState<AppState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Load state from localStorage only on the client side.
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Basic validation to ensure the parsed state has the expected shape
        if (parsed && typeof parsed === 'object' && 'sourceSchemas' in parsed && 'mappings' in parsed && 'set1' in parsed.mappings) {
          setStateValue(prevState => ({ ...prevState, ...parsed, isLoading: false }));
        } else {
            // If the stored state is old, reset to initial
            localStorage.removeItem('appState');
            setStateValue(initialState);
        }
      }
    } catch (e) {
      console.error("Failed to parse state from localStorage", e);
      // If parsing fails, we'll proceed with the initial state.
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes, but only after it has been initialized.
    if (isInitialized) {
        const stateToSave = { ...state };
        delete (stateToSave as Partial<AppState>).isLoading;
        localStorage.setItem('appState', JSON.stringify(stateToSave));
    }
  }, [state, isInitialized]);

  useEffect(() => {
    // On every route change, set loading to false.
    // The "start" of loading is handled by click handlers on links/buttons.
    if(state.isLoading) {
        setStateValue(prev => ({ ...prev, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);


  const setState = (newState: Partial<AppState>) => {
    setStateValue(prev => ({ ...prev, ...newState }));
  };

  const setIsLoading = (isLoading: boolean) => {
    setStateValue(prev => ({ ...prev, isLoading }));
  }

  const resetState = () => {
    setIsLoading(true);
    const soeid = state.soeid;
    setStateValue({...initialState, soeid});
    // Also clear it from localStorage
    localStorage.removeItem('appState');
    router.push('/new/upload');
  };
  
  const contextValue = {
    ...state,
    setState,
    resetState,
    setIsLoading,
  };

  // Do not render children until the state has been initialized from localStorage
  if (!isInitialized) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Loader className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Initializing...</p>
            </div>
        </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {state.isLoading && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Loader className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
      )}
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
