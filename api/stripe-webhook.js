import { supabaseAdmin } from "./_lib/auth.js";
import { stripe, syncSubscriptionToSupabase } from "./_lib/stripe.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  if (!stripe || !supabaseAdmin) {
    return res.status(500).send("Stripe or Supabase server credentials missing.");
  }

  const buf = await readRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.log("No userId in subscription metadata; skipping.");
          break;
        }

        const { data: existing } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!existing?.user) {
          console.log("User no longer exists; skipping.");
          break;
        }

        await syncSubscriptionToSupabase(userId, subscription);
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
