import React, { useState } from 'react'
import { products as productsApi } from '../lib/supabase.js'

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

function SubmitForm({ user, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    website_url: '',
    logo_url: '',
    category: 'AI Tools'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required')
      return false
    }
    if (!formData.tagline.trim()) {
      setError('Tagline is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.website_url.trim()) {
      setError('Website URL is required')
      return false
    }

    // Validate URL
    try {
      new URL(formData.website_url)
    } catch {
      setError('Invalid website URL')
      return false
    }

    if (formData.logo_url && formData.logo_url.trim()) {
      try {
        new URL(formData.logo_url)
      } catch {
        setError('Invalid logo URL')
        return false
      }
    }

    if (formData.name.length > 100) {
      setError('Product name must be less than 100 characters')
      return false
    }
    if (formData.tagline.length > 200) {
      setError('Tagline must be less than 200 characters')
      return false
    }
    if (formData.description.length > 1000) {
      setError('Description must be less than 1000 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Check for duplicate URL
      const { exists } = await productsApi.checkDuplicateUrl(formData.website_url)
      if (exists) {
        setError('A product with this website URL already exists')
        setLoading(false)
        return
      }

      // Submit product
      const { data, error: err } = await productsApi.create(formData)

      if (err) {
        setError(err.message || 'Failed to submit product')
        setLoading(false)
        return
      }

      setSuccess(true)
      setFormData({
        name: '',
        tagline: '',
        description: '',
        website_url: '',
        logo_url: '',
        category: 'AI Tools'
      })

      setTimeout(() => {
        onNavigate('home')
      }, 2000)
    } catch (err) {
      setError('Error submitting product: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div className="form-container">
        <h2 className="form-title">Submit Your Product</h2>

        {success && (
          <div style={{
            background: 'var(--success)',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            ✓ Product submitted successfully! Redirecting...
          </div>
        )}

        {error && (
          <div style={{
            background: 'var(--error)',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., ChatGPT Pro"
              maxLength="100"
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              {formData.name.length}/100
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="tagline">Tagline *</label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="A short, catchy description"
              maxLength="200"
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              {formData.tagline.length}/200
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product in detail (features, benefits, target audience)"
              maxLength="1000"
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              {formData.description.length}/1000
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="website_url">Website URL *</label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="logo_url">Logo URL (Optional)</label>
            <input
              type="url"
              id="logo_url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              PNG or JPG, preferably square (200x200px or larger)
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Product'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={() => onNavigate('home')}
          >
            Cancel
          </button>
        </form>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          Your product will be reviewed by our team and appear on the leaderboard once approved.
        </p>
      </div>
    </div>
  )
}

export default SubmitForm
