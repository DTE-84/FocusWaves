-- FocusWaves Subscriptions Schema (mirrors RunIQ billing pattern)
-- Run this once in your Supabase SQL Editor.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'monthly', 'annual')),
  status text not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Signed-in users can read their own subscription row; only service role / RPC can write.
drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Secure RPC called by api/stripe-webhook.js & api/subscription-status.js (service role)
create or replace function public.update_user_subscription(
  p_user_id uuid,
  p_tier text,
  p_status text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (
    user_id,
    tier,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    current_period_end,
    cancel_at_period_end,
    updated_at
  )
  values (
    p_user_id,
    coalesce(p_tier, 'free'),
    coalesce(p_status, 'none'),
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_current_period_end,
    coalesce(p_cancel_at_period_end, false),
    now()
  )
  on conflict (user_id)
  do update set
    tier = excluded.tier,
    status = excluded.status,
    stripe_customer_id = coalesce(excluded.stripe_customer_id, public.subscriptions.stripe_customer_id),
    stripe_subscription_id = excluded.stripe_subscription_id,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    updated_at = now();
end;
$$;
