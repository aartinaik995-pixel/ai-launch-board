-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  category TEXT NOT NULL CHECK (
    category IN (
      'AI Tools',
      'SaaS',
      'Startup',
      'Developer Tools',
      'Productivity',
      'Marketing',
      'Design',
      'Digital Products'
    )
  ),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_website_url ON products(website_url);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Create index for votes
CREATE INDEX IF NOT EXISTS idx_votes_product_id ON votes(product_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Featured Plans table (configuration)
CREATE TABLE IF NOT EXISTS featured_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_type TEXT NOT NULL UNIQUE CHECK (
    plan_type IN ('spotlight', 'launch_pack', 'partner')
  ),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default featured plans
INSERT INTO featured_plans (plan_type, name, description, duration_days, price_cents)
VALUES
  ('spotlight', 'Spotlight', '7 days on the leaderboard', 7, 2999),
  ('launch_pack', 'Launch Pack', '30 days featured placement', 30, 6999),
  ('partner', 'Partner', '90 days premium visibility', 90, 14999)
ON CONFLICT DO NOTHING;

-- Featured Requests table
CREATE TABLE IF NOT EXISTS featured_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_requests_product_id ON featured_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_requests_user_id ON featured_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_featured_requests_status ON featured_requests(status);

-- Featured Orders table (payment tracking)
CREATE TABLE IF NOT EXISTS featured_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES featured_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'expired', 'cancelled')
  ),
  payment_provider TEXT,
  payment_id TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_orders_product_id ON featured_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_orders_status ON featured_orders(status);
CREATE INDEX IF NOT EXISTS idx_featured_orders_expires_at ON featured_orders(expires_at);

-- Reports table (for admin tracking)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_product_id ON reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Anyone can view approved products" ON products
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own pending products" ON products
  FOR SELECT USING (
    status != 'approved' AND auth.uid() = user_id
  );

CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can submit products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Votes policies
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- Featured Requests policies
CREATE POLICY "Users can view their own requests" ON featured_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON featured_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create requests" ON featured_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Featured Orders policies
CREATE POLICY "Anyone can view active featured orders" ON featured_orders
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own orders" ON featured_orders
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_id
    )
  );

CREATE POLICY "Admins can manage orders" ON featured_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Reports policies
CREATE POLICY "Authenticated users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can view and manage reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create a profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- View for vote counts (performance optimization)
CREATE OR REPLACE VIEW product_votes AS
SELECT
  p.id as product_id,
  COUNT(v.id) as vote_count
FROM products p
LEFT JOIN votes v ON p.id = v.product_id
GROUP BY p.id;

-- View for featured products
CREATE OR REPLACE VIEW active_featured_products AS
SELECT
  p.*,
  fo.plan_type,
  fo.expires_at
FROM products p
JOIN featured_orders fo ON p.id = fo.product_id
WHERE fo.status = 'active'
AND fo.expires_at > NOW();
