#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🌱 Scout Tracker User Seeding');
console.log('================================\n');

// Validate environment
if (!supabaseUrl || supabaseUrl === 'https://xxx.supabase.co') {
  console.error('❌ ERROR: SUPABASE_URL is not configured');
  console.error('   1. Copy .env.local.example to .env.local');
  console.error('   2. Fill in SUPABASE_URL from your Supabase dashboard\n');
  process.exit(1);
}

if (!supabaseKey || supabaseKey === 'your-service-role-key') {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not configured');
  console.error('   1. Go to Supabase Dashboard > Project Settings > API');
  console.error('   2. Copy the "Service Role Key" to .env.local\n');
  process.exit(1);
}

// Initialize Supabase
const db = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function seedUsers() {
  try {
    console.log('📚 Fetching roles...\n');

    // Get roles
    const { data: roles, error: rolesError } = await db
      .from('roles')
      .select('id,nombre');

    if (rolesError) {
      throw new Error(`Failed to fetch roles: ${rolesError.message}`);
    }

    if (!roles || roles.length === 0) {
      throw new Error(
        'No roles found in database. Did you run the initial migration?\n' +
        'Run: supabase db push'
      );
    }

    console.log(`✅ Found ${roles.length} roles\n`);

    const superAdminRole = roles.find((r) => r.nombre === 'superadmin');
    const visorRole = roles.find((r) => r.nombre === 'visor');

    if (!superAdminRole) {
      throw new Error('superadmin role not found');
    }
    if (!visorRole) {
      throw new Error('visor role not found');
    }

    // Hash passwords
    console.log('🔐 Hashing passwords...\n');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const normalPassword = await bcrypt.hash('scout123', 12);

    const users = [
      {
        nombre: 'Admin User',
        email: 'admin@scouttracker.local',
        password_hash: adminPassword,
        role_id: superAdminRole.id,
        equipo_asignado: null,
        is_active: true
      },
      {
        nombre: 'Scout Viewer',
        email: 'scout@scouttracker.local',
        password_hash: normalPassword,
        role_id: visorRole.id,
        equipo_asignado: null,
        is_active: true
      }
    ];

    console.log(`👥 Creating ${users.length} users...\n`);

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      const { error } = await db
        .from('users')
        .insert(user);

      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  ${user.email} - Already exists (skipped)`);
          skipped++;
        } else {
          throw new Error(`Failed to create ${user.email}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${user.email} - Created`);
        created++;
      }
    }

    console.log('\n' + '='.repeat(40));
    console.log('🎉 Seed completed!');
    console.log('='.repeat(40) + '\n');

    if (created > 0) {
      console.log('✅ New users created:');
      created++;
    }
    if (skipped > 0) {
      console.log(`⚠️  ${skipped} user(s) already existed\n`);
    }

    console.log('📋 Login Credentials:');
    console.log('─'.repeat(40));
    console.log('\n🔓 Admin (Backoffice Access):');
    console.log('   Email: admin@scouttracker.local');
    console.log('   Password: admin123\n');

    console.log('👁️  Scout (View Only):');
    console.log('   Email: scout@scouttracker.local');
    console.log('   Password: scout123\n');

    console.log('─'.repeat(40));
    console.log('🚀 Next steps:');
    console.log('   1. npm run dev -w backend');
    console.log('   2. Open http://localhost:4000/api/auth/me');
    console.log('   3. POST to /api/auth/login with credentials\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedUsers();
