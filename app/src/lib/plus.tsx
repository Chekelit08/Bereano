import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { PLUS_ENTITLEMENT, REVENUECAT_ANDROID_KEY, REVENUECAT_IOS_KEY } from '@/constants/config';
import { ensureSession, supabase } from '@/lib/supabase';

type Status = 'loading' | 'ready' | 'demo';

type Ctx = {
  /** Lo que muestra la app. Quien decide de verdad (por ejemplo, el compañero) es el servidor. */
  isPlus: boolean;
  status: Status;
  annual: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
  purchase: (pkg: PurchasesPackage) => Promise<'ok' | 'cancelled' | 'error'>;
  restore: () => Promise<boolean>;
};

const PlusContext = createContext<Ctx | null>(null);

function apiKey(): string {
  if (Platform.OS === 'ios') return REVENUECAT_IOS_KEY;
  if (Platform.OS === 'android') return REVENUECAT_ANDROID_KEY;
  return ''; // en web no se vende
}

const hasPlus = (info: CustomerInfo) => Boolean(info.entitlements.active[PLUS_ENTITLEMENT]);

export function PlusProvider({ children }: { children: ReactNode }) {
  const [isPlus, setIsPlus] = useState(false);
  const [status, setStatus] = useState<Status>(apiKey() ? 'loading' : 'demo');
  const [annual, setAnnual] = useState<PurchasesPackage | null>(null);
  const [monthly, setMonthly] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    const key = apiKey();
    if (!key) return;
    const onUpdate = (info: CustomerInfo) => setIsPlus(hasPlus(info));
    let cancelled = false;
    (async () => {
      try {
        // RevenueCat usa el mismo id que Supabase: así el webhook sabe a quién darle Plus.
        let appUserID: string | undefined;
        try {
          await ensureSession();
          appUserID = (await supabase.auth.getUser()).data.user?.id;
        } catch {
          // Sin sesión todavía: RevenueCat usa un id anónimo y se une al iniciar sesión.
        }
        Purchases.configure({ apiKey: key, appUserID });
        Purchases.addCustomerInfoUpdateListener(onUpdate);
        const [info, offerings] = await Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()]);
        if (cancelled) return;
        setIsPlus(hasPlus(info));
        setAnnual(offerings.current?.annual ?? null);
        setMonthly(offerings.current?.monthly ?? null);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('demo');
      }
    })();
    return () => {
      cancelled = true;
      Purchases.removeCustomerInfoUpdateListener(onUpdate);
    };
  }, []);

  const value: Ctx = {
    isPlus,
    status,
    annual,
    monthly,
    purchase: async (pkg) => {
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        setIsPlus(hasPlus(customerInfo));
        return 'ok';
      } catch (e) {
        return (e as { userCancelled?: boolean }).userCancelled ? 'cancelled' : 'error';
      }
    },
    restore: async () => {
      try {
        const info = await Purchases.restorePurchases();
        setIsPlus(hasPlus(info));
        return hasPlus(info);
      } catch {
        return false;
      }
    },
  };

  return <PlusContext value={value}>{children}</PlusContext>;
}

export function usePlus(): Ctx {
  const ctx = use(PlusContext);
  if (!ctx) throw new Error('usePlus fuera de PlusProvider');
  return ctx;
}
