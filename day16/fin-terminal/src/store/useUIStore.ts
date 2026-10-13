import { create } from "zustand";

interface UIStore {
  selectedSymbol: string;
  selectedTimeframe: string;
  sidebarOpen: boolean;

  setSelectedSymbol: (symbol: string) => void;
  setSelectedTimeframe: (timeframe: string) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedSymbol: "AAPL",
  selectedTimeframe: "1D",
  sidebarOpen: true,

  setSelectedSymbol: (symbol) =>
    set({
      selectedSymbol: symbol,
    }),

  setSelectedTimeframe: (timeframe) =>
    set({
      selectedTimeframe: timeframe,
    }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
}));
