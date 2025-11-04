import { useEffect, useState } from "react";

type PersistHelpers = {
  persist?: {
    hasHydrated?: () => boolean;
    onFinishHydration?: (callback: () => void) => () => void;
    rehydrate?: () => void;
  };
};

export const useStoreHydration = (store: PersistHelpers) => {
  const [hydrated, setHydrated] = useState(() =>
    store.persist?.hasHydrated ? store.persist.hasHydrated() : true
  );

  useEffect(() => {
    const persist = store.persist;
    if (!persist) {
      return;
    }

    const unsubscribe = persist.onFinishHydration
      ? persist.onFinishHydration(() => setHydrated(true))
      : undefined;

    if (!persist.hasHydrated?.()) {
      persist.rehydrate?.();
    } else {
      setHydrated(true);
    }

    return () => {
      unsubscribe?.();
    };
  }, [store]);

  return hydrated;
};
