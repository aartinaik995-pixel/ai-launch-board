import React, { useState } from 'react'
import { auth } from '../lib/supabase.js'

function AuthForm({ onNavigate, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!email.includes('@')) {
      setError('Invalid email address')
      return false
    }
    if (!password) {
      setError('Password is required')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!validateForm()) {
      return
    }

    setLoading(true)
    const { data, error: err } = await auth.signUp(email, password)

    if (err) {
      setError(err.message || 'Failed to sign up')
    } else {
      setMessage('Sign up successful! Please check your email to confirm.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setMode('signin')
      }, 2000)
    }
    setLoading(false)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!validateForm()) {
      return
    }

    setLoading(true)
    const { data, error: err } = await auth.signIn(email, password)

    if (err) {
      setError(err.message || 'Failed to sign in')
    } else {
      setMessage('Signed in successfully!')
      setTimeout(() => {
        onNavigate('home')
      }, 1000)
    }
    setLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    const { data, error: err } = await auth.resetPassword(email)

    if (err) {
      setError(err.message || 'Failed to send reset email')
    } else {
      setMessage('Password reset email sent! Check your inbox.')
    }
    setLoading(false)
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div className="form-container">
        {mode === 'signin' && (
          <>
            <h2 className="form-title">Sign In</h2>

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

            {message && (
              <div style={{
                background: 'var(--success)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.5rem'
            }}>
              <p style={{ marginBottom: '1rem' }}>
                Don't have an account?{' '}
                <a
                  onClick={() => {
                    setMode('signup')
                    setError('')
                    setMessage('')
                  }}
                  style={{ cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign Up
                </a>
              </p>
              <a
                onClick={() => {
                  setMode('reset')
                  setError('')
                  setMessage('')
                }}
                style={{ cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Forgot password?
              </a>
            </div>
          </>
        )}

        {mode === 'signup' && (
          <>
            <h2 className="form-title">Create Account</h2>

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

            {message && (
              <div style={{
                background: 'var(--success)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  At least 6 characters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem'
            }}>
              <p>
                Already have an account?{' '}
                <a
                  onClick={() => {
                    setMode('signin')
                    setError('')
                    setMessage('')
                  }}
                  style={{ cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign In
                </a>
              </p>
            </div>
          </>
        )}

        {mode === 'reset' && (
          <>
            <h2 className="form-title">Reset Password</h2>

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

            {message && (
              <div style={{
                background: 'var(--success)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem'
            }}>
              <a
                onClick={() => {
                  setMode('signin')
                  setError('')
                  setMessage('')
                }}
                style={{ cursor: 'pointer' }}
              >
                Back to Sign In
              </a>
            </div>
          </>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onNavigate('home')}
            style={{ width: '100%' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
