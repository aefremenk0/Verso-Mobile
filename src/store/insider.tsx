import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ENTITLEMENT_ID,
  LOG_LEVEL,
  Purchases,
  REVENUECAT_IOS_KEY,
  hasRevenueCat,
} from "../lib/revenuecat";
import { useAuth } from "./auth";

// Verso Insider membership (premium).
//
// Two modes, same interface:
//  • Dev/standalone build with RevenueCat -> `isInsider` mirrors the real
//    "insider" entitlement; purchase()/restore() drive the store purchase.
//  • Expo Go / no SDK key -> mock preview: setInsider(true) unlocks the
//    Insider-only scenes so they can be tried out (no real purchase).
// Reset on logout.

export interface InsiderPackage {
  id: string;
  priceString: string;
  title: string;
}

interface InsiderContextValue {
  isInsider: boolean;
  /** Mock preview toggle. No-op when RevenueCat drives the entitlement. */
  setInsider: (v: boolean) => void;
  reset: () => void;
  /** True when a real paywall (RevenueCat) is available (dev build). */
  hasPaywall: boolean;
  packages: InsiderPackage[];
  loading: boolean;
  purchase: (pkgId: string) => Promise<{ error: string | null }>;
  restore: () => Promise<{ error: string | null }>;
}

const InsiderContext = createContext<InsiderContextValue | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function activeEntitlement(info: any): boolean {
  return Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPackage(p: any): InsiderPackage {
  return {
    id: p.identifier,
    priceString: p.product?.priceString ?? "",
    title: p.product?.title ?? p.identifier,
  };
}

export function InsiderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isInsider, setIsInsider] = useState(false);
  const [packages, setPackages] = useState<InsiderPackage[]>([]);
  const [loading, setLoading] = useState(false);

  // Configure RevenueCat once + subscribe to entitlement changes (native only).
  useEffect(() => {
    if (!hasRevenueCat) return;
    try {
      // Quiet the verbose DEBUG output — only warnings/errors from here on.
      if (LOG_LEVEL) Purchases.setLogLevel(LOG_LEVEL.WARN);
    } catch {
      /* ignore */
    }
    try {
      Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
    } catch {
      // configure can throw if called twice under Fast Refresh — ignore.
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (info: any) => setIsInsider(activeEntitlement(info));
    let remove: (() => void) | undefined;
    try {
      Purchases.addCustomerInfoUpdateListener(listener);
      remove = () => Purchases.removeCustomerInfoUpdateListener(listener);
    } catch {
      // listener API missing -> ignore
    }
    (async () => {
      try {
        setIsInsider(activeEntitlement(await Purchases.getCustomerInfo()));
      } catch {
        /* offline -> stay locked */
      }
      try {
        const offerings = await Purchases.getOfferings();
        const pkgs = offerings?.current?.availablePackages ?? [];
        setPackages(pkgs.map(mapPackage));
      } catch {
        /* no offerings configured yet -> empty */
      }
    })();
    return () => {
      try {
        remove?.();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tie the RevenueCat identity to the signed-in user (native only).
  useEffect(() => {
    if (!hasRevenueCat) return;
    (async () => {
      try {
        if (user?.id) await Purchases.logIn(user.id);
        else await Purchases.logOut();
        setIsInsider(activeEntitlement(await Purchases.getCustomerInfo()));
      } catch {
        /* logOut throws for anonymous users -> ignore */
      }
    })();
  }, [user?.id]);

  const setInsider = useCallback(
    (v: boolean) => {
      // The mock preview is allowed whenever there is nothing real to buy
      // (Expo Go, or a dev build without a configured RevenueCat offering).
      // Once real packages exist, the entitlement decides -> ignore the toggle.
      if (hasRevenueCat && packages.length > 0) return;
      setIsInsider(v);
    },
    [packages.length],
  );

  const reset = useCallback(() => {
    if (hasRevenueCat) {
      try {
        Purchases.logOut();
      } catch {
        /* ignore */
      }
    }
    setIsInsider(false);
  }, []);

  const purchase = useCallback(async (pkgId: string) => {
    if (!hasRevenueCat) {
      setIsInsider(true); // mock preview unlock
      return { error: null };
    }
    setLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list = offerings?.current?.availablePackages ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkg = list.find((p: any) => p.identifier === pkgId) ?? list[0];
      if (!pkg) {
        setLoading(false);
        return { error: "No package available" };
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsInsider(activeEntitlement(customerInfo));
      setLoading(false);
      return { error: null };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setLoading(false);
      if (e?.userCancelled) return { error: null };
      return { error: e?.message ?? "Purchase failed" };
    }
  }, []);

  const restore = useCallback(async () => {
    if (!hasRevenueCat) return { error: null };
    setLoading(true);
    try {
      setIsInsider(activeEntitlement(await Purchases.restorePurchases()));
      setLoading(false);
      return { error: null };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setLoading(false);
      return { error: e?.message ?? "Restore failed" };
    }
  }, []);

  const value = useMemo<InsiderContextValue>(
    () => ({
      isInsider,
      setInsider,
      reset,
      hasPaywall: hasRevenueCat,
      packages,
      loading,
      purchase,
      restore,
    }),
    [isInsider, setInsider, reset, packages, loading, purchase, restore],
  );

  return (
    <InsiderContext.Provider value={value}>{children}</InsiderContext.Provider>
  );
}

export function useInsider(): InsiderContextValue {
  const ctx = useContext(InsiderContext);
  if (!ctx)
    throw new Error("useInsider must be used within <InsiderProvider>.");
  return ctx;
}
