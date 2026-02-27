/**
 * Run SQL against Supabase using the pgREST API
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://owmwdsypvvaxsckflbxx.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable not set')
  console.log('\nTo get your service key:')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to Settings > API')
  console.log('4. Copy the "service_role" secret')
  console.log('\nThen run: SUPABASE_SERVICE_KEY=your_key node scripts/run-sql.js')
  process.exit(1)
}

const sql = `
-- Pantry Items Table
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  quantity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping List Table
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity TEXT,
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users manage own pantry" ON pantry_items;
CREATE POLICY "Users manage own pantry" ON pantry_items FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own shopping" ON shopping_list;
CREATE POLICY "Users manage own shopping" ON shopping_list FOR ALL USING (auth.uid() = user_id);
`

async function runSQL() {
  console.log('Running SQL to create pantry_items and shopping_list tables...')
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY
    },
    body: JSON.stringify({ query: sql })
  })

  // The pgRPC might not be enabled, let's try the SQL endpoint differently
  // Actually, let's try the direct postgrest endpoint
}

runSQL().catch(console.error)
