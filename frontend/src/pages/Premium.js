import React, { useState, useEffect } from 'react';
import '../styles/Premium.css';

function Premium({ user, setUser }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/premium/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/premium/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your Premium subscription?')) {
      try {
        const response = await fetch('/api/premium/cancel', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          alert('Subscription cancelled');
          fetchSubscriptionStatus();
        }
      } catch (err) {
        console.error('Error cancelling subscription:', err);
      }
    }
  };

  return (
    <div className="premium-page">
      <div className="premium-header">
        <h1>Study Assistant Premium</h1>
        <p>Unlock unlimited learning potential</p>
      </div>

      <div className="pricing-container">
        {/* Free Plan */}
        <div className="pricing-card free">
          <h2>Free</h2>
          <p className="price">$0/month</p>
          <ul className="features">
            <li>✓ 5 photo scans per month</li>
            <li>✓ Basic problem solving</li>
            <li>✗ Detailed explanations</li>
            <li>✗ AI tutor</li>
            <li>✗ Follow-up questions</li>
          </ul>
          <button className="btn-secondary" disabled={!user.isPremium}>
            {user.isPremium ? 'Upgrade Available' : 'You are here'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="pricing-card premium">
          <div className="premium-badge">Popular</div>
          <h2>Premium</h2>
          <p className="price">$9.99<span>/month</span></p>
          <ul className="features">
            <li>✓ Unlimited photo scans</li>
            <li>✓ Detailed step-by-step explanations</li>
            <li>✓ AI-powered tutor</li>
            <li>✓ Unlimited follow-up questions</li>
            <li>✓ All subjects (8+)</li>
            <li>✓ Priority support</li>
            <li>✓ Ad-free experience</li>
          </ul>
          {user.isPremium ? (
            <>
              <button className="btn-primary" disabled>
                ✓ Active Plan
              </button>
              {subscription?.premiumExpiresAt && (
                <p className="expiry-date">
                  Renews: {new Date(subscription.premiumExpiresAt).toLocaleDateString()}
                </p>
              )}
              <button className="btn-danger" onClick={handleCancel}>
                Cancel Subscription
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Processing...' : 'Upgrade to Premium'}
            </button>
          )}
        </div>
      </div>

      <div className="comparison">
        <h2>Feature Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Photo Scans</td>
              <td>5/month</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Text Questions</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Basic Solutions</td>
              <td>✓</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Detailed Explanations</td>
              <td>✗</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Step-by-Step Breakdown</td>
              <td>✗</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>AI Tutor</td>
              <td>✗</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Follow-up Questions</td>
              <td>✗</td>
              <td>Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Premium;
