import { requireUser } from "./_lib/auth.js";
import { stripe, findStripeRecords } from "./_lib/stripe.js";

const APP_URL = process.env.APP_URL || "https://focus-waves.vercel.app";

const PLANS = {
  annual: { priceId: () => process.env.STRIPE_PRICE_ANNUAL, trialDays: 7 },
  monthly: { priceId: () => process.env.STRIPE_PRICE_MONTHLY, trialDays: 7 },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Stripe billing is not configured yet." });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const planKey = req.body?.plan === "monthly" ? "monthly" : "annual";
  const plan = PLANS[planKey];
  const priceId = plan?.priceId();

  if (!plan || !priceId) {
    return res.status(400).json({ error: `Stripe price ID missing for plan: ${planKey}` });
  }

  try {
    const { customerId } = await findStripeRecords(user.id);

    const sessionParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/?checkout=success`,
      cancel_url: `${APP_URL}/?checkout=cancelled`,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: user.id, plan: planKey },
        ...(plan.trialDays ? { trial_period_days: plan.trialDays } : {}),
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (user.email) {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ error: "Could not start checkout session." });
  }
}
