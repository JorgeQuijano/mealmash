/**
 * MealMash Supabase Setup Script
 * 
 * Run this script to set up the database schema and storage bucket.
 * 
 * Usage:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Link to project: supabase link --project-ref owmwdsypvvaxsckflbxx
 * 3. Run: supabase db push (for schema)
 * 4. Run this script or manually create storage bucket
 */

const SUPABASE_URL = 'https://owmwdsypvvaxsckflbxx.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable not set')
  console.log('\nTo get your service key:')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to Settings > API')
  console.log('4. Copy the "service_role" secret')
  console.log('\nThen run: SUPABASE_SERVICE_KEY=your_key node setup-supabase.js')
  process.exit(1)
}

const createStorageBucket = async () => {
  console.log('Creating "recipes" storage bucket...')
  
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY
    },
    body: JSON.stringify({
      id: 'recipes',
      name: 'Recipes',
      public: true,
      file_size_limit: 5242880, // 5MB
      allowed_mime_types: ['image/*']
    })
  })

  if (response.ok) {
    console.log('✅ Storage bucket "recipes" created successfully')
  } else {
    const error = await response.json()
    console.log('Storage bucket creation:', error.message || 'May already exist')
  }
}

// Note: Database schema must be run manually in Supabase SQL Editor
// Copy the SQL from SUPABASE_SCHEMA.sql

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    MealMash Supabase Setup                     ║
╚══════════════════════════════════════════════════════════════╝

To complete setup, you need to:

1. Run the SQL schema in Supabase SQL Editor:
   - Go to: https://supabase.com/dashboard/project/owmwdsypvvaxsckflbxx/sql
   - Copy and run the contents of SUPABASE_SCHEMA.sql

2. Create the storage bucket:
   - Go to: https://supabase.com/dashboard/project/owmwdsypvvaxsckflbxx/storage
   - Click "New bucket"
   - Name it "recipes"
   - Enable "Public bucket"

3. Set environment variables in Vercel:
   NEXT_PUBLIC_SUPABASE_URL=https://owmwdsypvvaxsckflbxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

For more help, see the project README.
`)
