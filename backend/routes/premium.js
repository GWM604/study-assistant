const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

const PREMIUM_MONTHLY_CENTS = 999; // $9.99

// Create checkout session
router.post('/checkout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.isPremium) {
      return res.status(400).json({ error: 'Already a premium member' });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`
        });
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
      } catch (stripeError) {
        return res.status(400).json({ error: 'Failed to create Stripe customer' });
      }
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Study Assistant Premium',
                description: 'Unlimited photo scans, detailed explanations, AI tutor'
              },
              unit_amount: PREMIUM_MONTHLY_CENTS,
              recurring: {
                interval: 'month',
                interval_count: 1
              }
            },
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/premium/cancelled`
      });

      res.json({ sessionId: session.id });
    } catch (stripeError) {
      res.status(400).json({ error: 'Failed to create checkout session' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle webhook for subscription confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    const user = await User.findOne({ stripeCustomerId: customerId });
    if (user) {
      user.isPremium = true;
      user.premiumExpiresAt = new Date(subscription.current_period_end * 1000);
      user.photoScansLimit = 999999; // Unlimited
      await user.save();

      await Subscription.updateOne(
        { userId: user._id },
        {
          stripeSubscriptionId: subscription.id,
          plan: 'premium',
          status: 'active',
          renewalDate: new Date(subscription.current_period_end * 1000)
        }
      );
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    const user = await User.findOne({ stripeCustomerId: customerId });
    if (user) {
      user.isPremium = false;
      user.photoScansLimit = 5;
      user.photoScansUsed = 0;
      await user.save();

      await Subscription.updateOne(
        { userId: user._id },
        { plan: 'free', status: 'cancelled' }
      );
    }
  }

  res.json({ received: true });
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const subscription = await Subscription.findOne({ userId: req.userId });

    res.json({
      plan: user.isPremium ? 'premium' : 'free',
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      photoScansUsed: user.photoScansUsed,
      photoScansLimit: user.photoScansLimit,
      subscription: subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    try {
      await stripe.subscriptions.del(user.stripeSubscriptionId);
      res.json({ message: 'Subscription cancelled successfully' });
    } catch (stripeError) {
      res.status(400).json({ error: 'Failed to cancel subscription' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
