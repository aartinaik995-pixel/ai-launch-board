import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check .env file.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper functions for common operations
export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  },
}

// Product operations
export const products = {
  create: async (productData) => {
    const { data: user } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, user_id: user?.user?.id, status: 'pending' }])
    return { data, error }
  },

  getAll: async (filters = {}) => {
    let query = supabase
      .from('products')
      .select('*, votes(count), featured_orders(id, plan_type, expires_at)')
      .eq('status', 'approved')

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (filters.sortBy === 'alpha') {
      query = query.order('name', { ascending: true })
    } else {
      // Default: by votes
      query = query.order('votes', { ascending: false, referencedTable: 'votes' })
    }

    const { data, error } = await query
    return { data, error }
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, votes(count), featured_orders(id, plan_type, expires_at)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  getPending: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  approve: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .update({ status: 'approved' })
      .eq('id', id)
    return { data, error }
  },

  reject: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .update({ status: 'rejected' })
      .eq('id', id)
    return { data, error }
  },

  checkDuplicateUrl: async (websiteUrl) => {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('website_url', websiteUrl)
      .single()
    return { exists: !error, error }
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
    return { data, error }
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    return { error }
  },
}

// Voting operations
export const votes = {
  vote: async (productId) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) throw new Error('Not authenticated')

    // Check if user already voted
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.user.id)
      .single()

    if (existing) {
      throw new Error('You already voted for this product')
    }

    const { data, error } = await supabase
      .from('votes')
      .insert([{ product_id: productId, user_id: user.user.id }])
    return { data, error }
  },

  removeVote: async (productId) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', user.user.id)
    return { error }
  },

  getVoteCount: async (productId) => {
    const { count, error } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
    return { count: count || 0, error }
  },

  hasVoted: async (productId) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) return { voted: false, error: null }

    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.user.id)
      .single()

    return { voted: !!data, error }
  },
}

// Featured listings operations
export const featured = {
  requestFeature: async (productId, planType) => {
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('featured_requests')
      .insert([
        {
          product_id: productId,
          plan_type: planType,
          user_id: user?.user?.id,
          status: 'pending',
        },
      ])
    return { data, error }
  },

  createOrder: async (requestId, planType) => {
    const planDurations = {
      spotlight: 7,
      launch_pack: 30,
      partner: 90,
    }

    const durationDays = planDurations[planType] || 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    const { data, error } = await supabase
      .from('featured_orders')
      .insert([
        {
          request_id: requestId,
          plan_type: planType,
          amount: getPlanPrice(planType),
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        },
      ])
    return { data, error }
  },

  completePayment: async (orderId) => {
    const { data, error } = await supabase
      .from('featured_orders')
      .update({ status: 'active' })
      .eq('id', orderId)
    return { data, error }
  },

  getActiveFeatures: async () => {
    const { data, error } = await supabase
      .from('featured_orders')
      .select('*, products(id, name)')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
    return { data, error }
  },
}

// Helper function for plan prices
export const getPlanPrice = (planType) => {
  const prices = {
    spotlight: 2999, // 29.99 in cents
    launch_pack: 6999, // 69.99 in cents
    partner: 14999, // 149.99 in cents
  }
  return prices[planType] || 0
}

// Profiles
export const profiles = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
    return { data, error }
  },

  isAdmin: async (userId) => {
    const { data } = await profiles.get(userId)
    return data?.role === 'admin'
  },
}
