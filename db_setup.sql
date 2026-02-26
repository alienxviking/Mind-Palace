-- Create nodes table
CREATE TABLE nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  color INTEGER NOT NULL,
  position JSONB NOT NULL, -- {x, y, z}
  tags TEXT[],
  ai_summary TEXT
);

-- Create edges (links) table for relationships
CREATE TABLE edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  target_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  strength FLOAT DEFAULT 1.0,
  relation_type TEXT
);

-- Setup Row Level Security (RLS)
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own nodes" 
ON nodes FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own edges"
ON edges FOR ALL
USING (EXISTS (
  SELECT 1 FROM nodes WHERE nodes.id = edges.source_id AND nodes.user_id = auth.uid()
));
