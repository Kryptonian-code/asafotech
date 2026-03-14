# Paystack Setup

Use Paystack to collect checkout payments for Asafo Tech.

## Required env values

Add these to the main project env file:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=http://localhost/e-commerce/order-success
```

For production or LAN testing, update `PAYSTACK_CALLBACK_URL` to your real app URL.

## What the integration does

- Creates a pending local order first
- Redirects the customer to Paystack
- Verifies the returned Paystack reference on the backend
- Marks the order payment as `paid` and moves order status to `processing`

## Notes

- Keep `PAYSTACK_SECRET_KEY` server-side only
- Do not put the secret key in frontend-only variables like `VITE_*`
- If the customer abandons payment, the order remains `pending`

## Official docs

- Initialize Transaction: https://paystack.com/docs/api/transaction/#initialize
- Verify Transaction: https://paystack.com/docs/api/transaction/#verify
