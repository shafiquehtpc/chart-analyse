-- Create the analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  timeframe VARCHAR(20) NOT NULL,
  bias VARCHAR(50) NOT NULL,
  entry DECIMAL(10, 2) NOT NULL,
  tp DECIMAL(10, 2) NOT NULL,
  sl DECIMAL(10, 2) NOT NULL,
  reasoning TEXT NOT NULL,
  raw_market_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to read only their own analyses
CREATE POLICY "Users can view their own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policy for users to insert their own analyses
CREATE POLICY "Users can insert their own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for charts
INSERT INTO storage.buckets (id, name, public)
VALUES ('charts', 'charts', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public read access to the charts bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'charts');

-- Allow authenticated users to upload to charts bucket
CREATE POLICY "Authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'charts'
    AND auth.role() = 'authenticated'
  );