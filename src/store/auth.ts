import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
  isLoggedIn: boolean;
  accessToken: string | null;
  setSession: (token: string) => void;
  clearSession: () => void;
};

const createSessionStorage = () =>
  createJSONStorage<AuthState>(() => sessionStorage);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      accessToken: null,
      setSession: (token) =>
        set({
          isLoggedIn: true,
          accessToken: token
        }),
      clearSession: () =>
        set({
          isLoggedIn: false,
          accessToken: null
        })
    }),
    {
      name: "auth/session",
      skipHydration: true,
      storage: typeof window === "undefined" ? undefined : createSessionStorage()
    }
  )
);
