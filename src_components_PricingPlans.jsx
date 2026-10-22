import React from 'react'

function PricingPlans() {
  const plans = [
    {
      type: 'spotlight',
      name: 'Spotlight',
      price: 29.99,
      duration: '7 days',
      features: [
        'Featured placement on homepage',
        'Highlighted badge on product card',
        '7 days visibility boost',
        'Social media promotion'
      ]
    },
    {
      type: 'launch_pack',
      name: 'Launch Pack',
      price: 69.99,
      duration: '30 days',
      featured: true,
      features: [
        'All Spotlight features',
        'Prime positioning on leaderboard',
        '30 days featured placement',
        'Email newsletter mention',
        'Dedicated support'
      ]
    },
    {
      type: 'partner',
      name: 'Partner',
      price: 149.99,
      duration: '90 days',
      features: [
        'All Launch Pack features',
        'Premium featured section',
        '90 days visibility',
        'Monthly performance reports',
        'Partnership badge',
        'Priority support'
      ]
    }
  ]

  const handleSelectPlan = (planType) => {
    alert(`To activate the ${planType} plan, please sign in and submit a product first.

Payment processing is ready for integration with Stripe.

Steps:
1. Sign in or create an account
2. Submit your product
3. Navigate to featured listing request
4. Complete payment on Stripe (test mode)

After successful payment, your product will automatically be featured.`)
  }

  return (
    <section className="pricing">
      <div className="container">
        <div className="pricing-title">
          <h2>Featured Listing Plans</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Boost your product's visibility with our featured placement options
          </p>
        </div>

        <div className="pricing-cards">
          {plans.map(plan => (
            <div
              key={plan.type}
              className={`pricing-card ${plan.featured ? 'featured' : ''}`}
            >
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">${plan.price}</div>
              <div className="pricing-duration">{plan.duration}</div>

              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              <button
                className="btn btn-primary"
                onClick={() => handleSelectPlan(plan.type)}
                style={{ width: '100%' }}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginTop: '3rem',
          maxWidth: '800px',
          margin: '3rem auto 0'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Payment & Integration</h3>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h4 style={{ marginBottom: '0.5rem' }}>🔗 Stripe Integration</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              This application is ready for Stripe payment integration. To enable live payments:
            </p>
            <ol style={{
              marginTop: '1rem',
              marginLeft: '1.5rem',
              color: 'var(--text-secondary)'
            }}>
              <li>Create a Stripe account at stripe.com</li>
              <li>Get your publishable and secret keys</li>
              <li>Add keys to .env as VITE_STRIPE_PUBLIC_KEY</li>
              <li>Create a backend endpoint for payment confirmation</li>
              <li>Update CheckoutPage.jsx with Stripe Elements</li>
            </ol>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            borderRadius: '0.5rem'
          }}>
            <h4 style={{ marginBottom: '0.5rem' }}>📊 Current Status</h4>
            <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              <li>✅ Payment data model implemented</li>
              <li>✅ Order tracking system ready</li>
              <li>✅ Automatic expiry logic in place</li>
              <li>⏳ Stripe checkout integration awaiting keys</li>
              <li>⏳ Webhook verification pending</li>
            </ul>
          </div>
        </div>

        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'rgba(99, 102, 241, 0.05)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>FAQ</h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>When do my featured days start?</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Featured days begin immediately after successful payment verification. Your product will appear in the featured section of the leaderboard.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Can I extend my featured placement?</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Yes! You can purchase additional featured plans at any time. They will extend your current placement.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Does featuring affect voting?</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              No, featured placement is purely a visibility feature. Your product's ranking is still determined by community votes, not payment.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingPlans
