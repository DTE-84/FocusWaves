import { requireUser, supabaseAdmin, isActiveSubscription } from "./_lib/auth.js";
import { findStripeRecords, syncSubscriptionToSupabase } from "./_lib/stripe.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select(
        "tier, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    let record = data;

    // If the user just returned from Stripe Checkout before the webhook landed,
    // verify directly against Stripe and sync to Supabase.
    if (!isActiveSubscription(record)) {
      const { subscription } = await findStripeRecords(user.id);
      if (subscription && ["active", "trialing"].includes(subscription.status)) {
        record = await syncSubscriptionToSupabase(user.id, subscription);
      }
    }

    const isPro = isActiveSubscription(record);

    return res.status(200).json({
      isPro,
      tier: record?.tier ?? "free",
      status: record?.status ?? "none",
      currentPeriodEnd: record?.current_period_end ?? null,
      cancelAtPeriodEnd: Boolean(record?.cancel_at_period_end),
      hasStripeCustomer: Boolean(record?.stripe_customer_id),
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return res.status(500).json({ error: "Failed to verify subscription status." });
  }
}
