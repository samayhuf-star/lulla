import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { ENTITLEMENT_ID, RC_API_KEY_ANDROID, RC_API_KEY_IOS } from './config';

let configured = false;

export function initPurchases(): boolean {
  if (configured) return true;
  const key = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  if (!key || key.includes('REPLACE_ME')) return false; // not configured yet (dev)
  Purchases.configure({ apiKey: key });
  configured = true;
  Purchases.setAttributes({ app: 'lulla', platform: Platform.OS });
  Purchases.collectDeviceIdentifiers();
  return true;
}

export const isConfigured = () => configured;

export function hasPremium(info: CustomerInfo | null | undefined): boolean {
  return !!info?.entitlements.active[ENTITLEMENT_ID];
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export function onCustomerInfo(cb: (info: CustomerInfo) => void) {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(cb);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(cb);
  };
}

export async function getMonthlyPackage(): Promise<PurchasesPackage | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const cur = offerings.current;
    return cur?.monthly ?? cur?.availablePackages[0] ?? null;
  } catch {
    return null;
  }
}

export async function purchase(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return hasPremium(customerInfo);
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  return hasPremium(info);
}
