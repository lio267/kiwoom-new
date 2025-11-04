import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "dark" | "light";

type UIState = {
  theme: Theme;
  isSidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
};

const createLocalStorage = () =>
  createJSONStorage<UIState>(() => localStorage);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      isSidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen
        }))
    }),
    {
      name: "ui/preferences",
      skipHydration: true,
      storage: typeof window === "undefined" ? undefined : createLocalStorage()
    }
  )
);
