import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import SubmitForm from './components/SubmitForm.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import AuthForm from './components/AuthForm.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import PricingPlans from './components/PricingPlans.jsx'
import Footer from './components/Footer.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Check if user is admin
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }

      setLoading(false)
    }

    checkUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
          setIsAdmin(profile?.role === 'admin')
        } else {
          setIsAdmin(false)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
    setSelectedProduct(null)
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setCurrentPage('product-detail')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    handleNavigate('home')
  }

  return (
    <div className="app">
      <Header
        user={user}
        isAdmin={isAdmin}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {currentPage === 'home' && (
        <>
          <Hero onNavigate={handleNavigate} />
          <Leaderboard onViewProduct={handleViewProduct} />
        </>
      )}

      {currentPage === 'submit' && user ? (
        <SubmitForm
          user={user}
          onNavigate={handleNavigate}
        />
      ) : currentPage === 'submit' && !user ? (
        <AuthForm
          onNavigate={handleNavigate}
          initialMode="signup"
        />
      ) : null}

      {currentPage === 'pricing' && (
        <PricingPlans />
      )}

      {currentPage === 'product-detail' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          user={user}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'auth' && (
        <AuthForm onNavigate={handleNavigate} />
      )}

      {currentPage === 'admin' && isAdmin && (
        <AdminDashboard
          user={user}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'admin' && !isAdmin && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin dashboard.</p>
          <button
            className="btn btn-primary"
            onClick={() => handleNavigate('home')}
          >
            Back to Home
          </button>
        </div>
      )}

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export default App
