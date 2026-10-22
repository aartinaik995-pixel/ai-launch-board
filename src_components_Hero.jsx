import React from 'react'

function Hero({ onNavigate }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>The leaderboard for what's launching in AI.</h1>
        <p>
          Discover, launch, and vote for AI tools, SaaS, startups, and digital products.
        </p>
        <div className="hero-buttons">
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('submit')}
          >
            Submit Your Product
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('pricing')}
            style={{ background: 'rgba(255, 255, 255, 0.2)', borderColor: 'white', color: 'white' }}
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
