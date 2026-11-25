import Stripe from "stripe";
import { supabaseAdmin } from "./auth.js";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function mapStripeTier(priceId) {
  if (priceId && priceId === process.env.STRIPE_PRICE_ANNUAL) return "annual";
  if (priceId && priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  return "free";
}

export async function findStripeRecords(userId) {
  let customerId = null;
  let subscription = null;

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data?.stripe_customer_id) {
      customerId = data.stripe_customer_id;
    }
  }

  if (stripe) {
    try {
      const search = await stripe.subscriptions.search({
        query: `metadata['userId']:'${userId}'`,
        limit: 5,
      });

      const preferred =
        search.data.find((s) => ["active", "trialing"].includes(s.status)) ||
        search.data[0] ||
        null;

      if (preferred) {
        subscription = preferred;
        if (!customerId && typeof preferred.customer === "string") {
          customerId = preferred.customer;
        }
      }
    } catch (err) {
      console.error("Stripe subscription search failed:", err?.message || err);
    }
  }

  return { customerId, subscription };
}

export async function syncSubscriptionToSupabase(userId, subscription) {
  if (!supabaseAdmin || !subscription) return null;

  const priceId = subscription.items?.data?.[0]?.price?.id;
  const tier = mapStripeTier(priceId);
  const periodEndUnix =
    subscription.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end;
  const currentPeriodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : null;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const payload = {
    p_user_id: userId,
    p_tier: tier,
    p_status: subscription.status,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscription.id,
    p_current_period_end: currentPeriodEnd,
    p_cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  };

  const { error } = await supabaseAdmin.rpc("update_user_subscription", payload);
  if (error) {
    // Fallback direct upsert if RPC has not been created yet
    const { error: upsertErr } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        tier,
        status: subscription.status,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (upsertErr) {
      throw upsertErr;
    }
  }

  return {
    tier,
    status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  };
}
