import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.')
  console.error('Run with: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node scripts/seed.mjs')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const members = [
  { name: 'Abir' },
  { name: 'Tanveer' },
  { name: 'Monira' },
  { name: 'Mahamudul' },
  { name: 'Rony' },
  { name: 'Mouri' },
  { name: 'Tahsin' },
  { name: 'Raida' },
]

const categories = [
  { name: 'House Rent', icon: 'home' },
  { name: 'Food', icon: 'utensils' },
  { name: 'Travel Up', icon: 'arrow-up' },
  { name: 'Travel Down', icon: 'arrow-down' },
  { name: 'Miscellaneous', icon: 'package' },
]

async function seed() {
  console.log('Seeding members...')
  const { data: memData, error: memErr } = await supabase
    .from('members')
    .upsert(members, { onConflict: 'name', ignoreDuplicates: true })
    .select()

  if (memErr) {
    console.error('Error inserting members:', memErr.message)
    process.exit(1)
  }
  console.log(`  ✓ ${memData.length} members inserted`)

  console.log('Seeding expense_categories...')
  const { data: catData, error: catErr } = await supabase
    .from('expense_categories')
    .upsert(categories, { onConflict: 'name', ignoreDuplicates: true })
    .select()

  if (catErr) {
    console.error('Error inserting categories:', catErr.message)
    process.exit(1)
  }
  console.log(`  ✓ ${catData.length} categories inserted`)

  // Verify
  console.log('\nVerifying members:')
  const { data: verifyMem } = await supabase.from('members').select('id, name').order('id')
  verifyMem?.forEach((m) => console.log(`  ${m.id}: ${m.name}`))

  console.log('\nVerifying categories:')
  const { data: verifyCat } = await supabase.from('expense_categories').select('id, name, icon').order('id')
  verifyCat?.forEach((c) => console.log(`  ${c.id}: ${c.name} (${c.icon})`))

  console.log('\n✅ Seed complete!')
}

seed()
