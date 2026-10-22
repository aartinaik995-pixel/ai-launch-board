import React, { useState, useEffect } from 'react'
import { supabase, products as productsApi, votes as votesApi } from '../lib/supabase.js'

const CATEGORIES = [
  'AI Tools',
  'SaaS',
  'Startup',
  'Developer Tools',
  'Productivity',
  'Marketing',
  'Design',
  'Digital Products'
]

function Leaderboard({ onViewProduct }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortBy, setSortBy] = useState('votes')
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const [votedProducts, setVotedProducts] = useState(new Set())
  const [productVotes, setProductVotes] = useState({})

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, sortBy, searchTerm])

  useEffect(() => {
    if (user && products.length > 0) {
      loadUserVotes()
    }
  }, [user, products])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await productsApi.getAll({
        category: selectedCategory,
        sortBy: sortBy
      })

      if (err) {
        setError('Failed to load products')
        return
      }

      // Filter by search term
      let filtered = data || []
      if (searchTerm) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Fetch vote counts and sort
      const productsWithVotes = await Promise.all(
        filtered.map(async (product) => {
          const { count } = await votesApi.getVoteCount(product.id)
          return { ...product, vote_count: count }
        })
      )

      // Sort by votes if needed
      if (sortBy === 'votes') {
        productsWithVotes.sort((a, b) => b.vote_count - a.vote_count)
      }

      setProducts(productsWithVotes)

      // Store vote counts
      const voteCounts = {}
      productsWithVotes.forEach(p => {
        voteCounts[p.id] = p.vote_count
      })
      setProductVotes(voteCounts)
    } catch (err) {
      setError('Error loading products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUserVotes = async () => {
    try {
      const voted = new Set()
      for (const product of products) {
        const { voted: hasVoted } = await votesApi.hasVoted(product.id)
        if (hasVoted) {
          voted.add(product.id)
        }
      }
      setVotedProducts(voted)
    } catch (err) {
      console.error('Error loading votes:', err)
    }
  }

  const handleVote = async (productId) => {
    if (!user) {
      alert('Please sign in to vote')
      return
    }

    try {
      if (votedProducts.has(productId)) {
        // Remove vote
        await votesApi.removeVote(productId)
        setVotedProducts(prev => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
        setProductVotes(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) - 1
        }))
      } else {
        // Add vote
        await votesApi.vote(productId)
        setVotedProducts(prev => new Set(prev).add(productId))
        setProductVotes(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1
        }))
      }
    } catch (err) {
      alert(err.message || 'Error processing vote')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="loading">Loading products...</div>
      </div>
    )
  }

  return (
    <section className="leaderboard">
      <div className="container">
        <h2 style={{ marginBottom: '2rem' }}>Product Leaderboard</h2>

        <div className="filters">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="filter-group">
            <button
              className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-buttons">
            <button
              className={`filter-btn ${sortBy === 'votes' ? 'active' : ''}`}
              onClick={() => setSortBy('votes')}
            >
              Top Voted
            </button>
            <button
              className={`filter-btn ${sortBy === 'newest' ? 'active' : ''}`}
              onClick={() => setSortBy('newest')}
            >
              Newest
            </button>
            <button
              className={`filter-btn ${sortBy === 'alpha' ? 'active' : ''}`}
              onClick={() => setSortBy('alpha')}
            >
              A-Z
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="product-list">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => onViewProduct(product)}
              >
                <div className="product-header">
                  {product.logo_url && (
                    <img
                      src={product.logo_url}
                      alt={product.name}
                      className="product-logo"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-tagline">{product.tagline}</div>
                    <span className="product-category">{product.category}</span>
                  </div>
                </div>

                <p className="product-description">{product.description}</p>

                <div className="product-footer">
                  <button
                    className={`vote-button ${votedProducts.has(product.id) ? 'voted' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(product.id)
                    }}
                  >
                    👍 {productVotes[product.id] || 0}
                  </button>
                  {product.featured && (
                    <span className="featured-badge">⭐ Featured</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Leaderboard
