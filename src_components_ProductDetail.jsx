import React, { useState, useEffect } from 'react'
import { votes as votesApi } from '../lib/supabase.js'

function ProductDetail({ product, user, onNavigate }) {
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVoteData()
  }, [product, user])

  const loadVoteData = async () => {
    try {
      const { count } = await votesApi.getVoteCount(product.id)
      setVoteCount(count)

      if (user) {
        const { voted: hasVoted } = await votesApi.hasVoted(product.id)
        setVoted(hasVoted)
      }
    } catch (err) {
      console.error('Error loading vote data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!user) {
      onNavigate('auth')
      return
    }

    try {
      if (voted) {
        await votesApi.removeVote(product.id)
        setVoted(false)
        setVoteCount(voteCount - 1)
      } else {
        await votesApi.vote(product.id)
        setVoted(true)
        setVoteCount(voteCount + 1)
      }
    } catch (err) {
      alert(err.message || 'Error processing vote')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <button
        className="btn btn-outline btn-small"
        onClick={() => onNavigate('home')}
        style={{ marginBottom: '2rem' }}
      >
        ← Back to Leaderboard
      </button>

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {product.logo_url && (
            <img
              src={product.logo_url}
              alt={product.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '0.75rem',
                objectFit: 'cover',
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '0.5rem' }}>{product.name}</h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem'
            }}>
              {product.tagline}
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <span className="product-category">{product.category}</span>
              {product.featured && (
                <span className="featured-badge" style={{ marginLeft: '0.5rem' }}>
                  ⭐ Featured
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'var(--primary)'
                }}>
                  {voteCount}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Votes
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem'
                }}>
                  Submitted
                </div>
                <div style={{ fontWeight: '600' }}>
                  {new Date(product.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className={`btn ${voted ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleVote}
              >
                👍 {voted ? 'Voted' : 'Vote'} ({voteCount})
              </button>

              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Visit Website →
              </a>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>About</h3>
          <p style={{
            lineHeight: '1.8',
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap'
          }}>
            {product.description}
          </p>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'var(--bg-tertiary)',
          borderRadius: '0.5rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Website</h4>
          <a
            href={product.website_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--primary)',
              wordBreak: 'break-all'
            }}
          >
            {product.website_url}
          </a>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Want to feature this product?
          </p>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('pricing')}
          >
            View Featured Plans
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
