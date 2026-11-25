import { requireUser } from "./_lib/auth.js";
import { stripe, findStripeRecords } from "./_lib/stripe.js";

const APP_URL = process.env.APP_URL || "https://focus-waves.vercel.app";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Stripe billing is not configured yet." });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { customerId } = await findStripeRecords(user.id);
    if (!customerId) {
      return res.status(404).json({ error: "No active subscription found for this account." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: APP_URL,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return res.status(500).json({ error: "Could not open subscription management." });
  }
}
