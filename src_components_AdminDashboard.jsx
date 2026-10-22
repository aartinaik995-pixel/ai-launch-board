import React, { useState, useEffect } from 'react'
import { supabase, products as productsApi } from '../lib/supabase.js'

function AdminDashboard({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingProducts, setPendingProducts] = useState([])
  const [approvedProducts, setApprovedProducts] = useState([])
  const [rejectedProducts, setRejectedProducts] = useState([])
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, votes: 0 })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load pending products
      const { data: pending } = await productsApi.getPending()
      setPendingProducts(pending || [])

      // Load all products for stats
      const { data: allData } = await supabase
        .from('products')
        .select('*, votes(count)')

      if (allData) {
        const approved = allData.filter(p => p.status === 'approved')
        const rejected = allData.filter(p => p.status === 'rejected')

        setApprovedProducts(approved)
        setRejectedProducts(rejected)

        let totalVotes = 0
        allData.forEach(p => {
          if (p.votes && Array.isArray(p.votes)) {
            totalVotes += p.votes.length
          }
        })

        setStats({
          total: allData.length,
          approved: approved.length,
          pending: (pending || []).length,
          votes: totalVotes
        })
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId) => {
    setActionLoading(true)
    try {
      const { error } = await productsApi.approve(productId)
      if (error) {
        alert('Error approving product: ' + error.message)
      } else {
        alert('Product approved successfully!')
        loadDashboardData()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (productId) => {
    if (!window.confirm('Are you sure you want to reject this product?')) {
      return
    }

    setActionLoading(true)
    try {
      const { error } = await productsApi.reject(productId)
      if (error) {
        alert('Error rejecting product: ' + error.message)
      } else {
        alert('Product rejected')
        loadDashboardData()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('This will permanently delete the product. Continue?')) {
      return
    }

    setActionLoading(true)
    try {
      const { error } = await productsApi.delete(productId)
      if (error) {
        alert('Error deleting product: ' + error.message)
      } else {
        alert('Product deleted')
        loadDashboardData()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Admin Dashboard</h1>
          <button
            className="btn btn-outline btn-small"
            onClick={() => onNavigate('home')}
          >
            ← Back Home
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Total Products
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
              {stats.total}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Approved
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>
              {stats.approved}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Pending Review
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--warning)' }}>
              {stats.pending}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Total Votes
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
              {stats.votes}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingProducts.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedProducts.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({rejectedProducts.length})
          </button>
        </div>

        {/* Pending Products Table */}
        {activeTab === 'pending' && (
          <div>
            {pendingProducts.length === 0 ? (
              <div className="empty-state">
                <h3>No pending products</h3>
                <p>All submissions have been reviewed</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Website</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <small style={{ color: 'var(--text-secondary)' }}>{product.tagline}</small>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                          {new URL(product.website_url).hostname}
                        </a>
                      </td>
                      <td>
                        <small>{new Date(product.created_at).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn btn-approve"
                            onClick={() => handleApprove(product.id)}
                            disabled={actionLoading}
                          >
                            Approve
                          </button>
                          <button
                            className="action-btn btn-reject"
                            onClick={() => handleReject(product.id)}
                            disabled={actionLoading}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Approved Products Table */}
        {activeTab === 'approved' && (
          <div>
            {approvedProducts.length === 0 ? (
              <div className="empty-state">
                <h3>No approved products</h3>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <small style={{ color: 'var(--text-secondary)' }}>{product.tagline}</small>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                          {new URL(product.website_url).hostname}
                        </a>
                      </td>
                      <td>
                        <span style={{
                          background: 'var(--success)',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          ✓ Live
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn btn-reject"
                          onClick={() => handleDelete(product.id)}
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Rejected Products Table */}
        {activeTab === 'rejected' && (
          <div>
            {rejectedProducts.length === 0 ? (
              <div className="empty-state">
                <h3>No rejected products</h3>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <small style={{ color: 'var(--text-secondary)' }}>{product.tagline}</small>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                          {new URL(product.website_url).hostname}
                        </a>
                      </td>
                      <td>
                        <span style={{
                          background: 'var(--error)',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          ✗ Rejected
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn btn-approve"
                          onClick={() => handleApprove(product.id)}
                          disabled={actionLoading}
                        >
                          Re-approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
