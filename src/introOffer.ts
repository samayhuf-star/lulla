// Introductory free-trial copy for the paywall. Pure, no native imports, so it can be unit tested.

type Period = { unit?: string | null; value?: number | null } | null | undefined;
export interface OfferLike {
  type?: string | null;
  paymentMode?: string | null;
  period?: Period;
  periodCount?: number | null;
}
export interface ProductLike {
  subscriptionOffers?: OfferLike[] | null;
  introductoryPricePaymentModeIOS?: string | null;
  introductoryPriceSubscriptionPeriodIOS?: string | null;
  introductoryPriceNumberOfPeriodsIOS?: string | null;
}

const DAYS: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };

/** Length in days of the product's introductory free trial, or null when it has none. */
export function freeTrialDays(p: ProductLike | null | undefined): number | null {
  if (!p) return null;
  for (const o of p.subscriptionOffers ?? []) {
    if (o?.type !== 'introductory' || o.paymentMode !== 'free-trial') continue;
    const unit = o.period?.unit ?? '';
    const per = DAYS[unit];
    if (!per) continue;
    const days = per * (o.period?.value || 1) * (o.periodCount || 1);
    if (days > 0) return days;
  }
  if (p.introductoryPricePaymentModeIOS === 'free-trial') {
    const per = DAYS[p.introductoryPriceSubscriptionPeriodIOS ?? ''];
    const n = parseInt(p.introductoryPriceNumberOfPeriodsIOS ?? '1', 10) || 1;
    if (per) return per * n;
  }
  return null;
}

/** Text on a plan button. The trial line shows only for an eligible user with a real trial offer. */
export function planButtonText(plan: { label: string; price: string; kind: 'monthly' | 'yearly' | 'lifetime'; trialDays?: number | null }): string {
  // Lifetime is a one-time purchase and never shows trial copy.
  if (plan.kind === 'lifetime') return `${plan.label} · ${plan.price} one-time`;
  const period = plan.kind === 'yearly' ? 'year' : 'month';
  if (plan.trialDays && plan.trialDays > 0) return `${plan.trialDays} days free, then ${plan.price}/${period}`;
  return `${plan.label} · ${plan.price} / ${period}`;
}
