import { createClient } from '@supabase/supabase-js';

// Hardcoded for now - will read from env in production
const supabaseUrl = 'https://ghgqkmdtunlxvvweyzbf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZ3FrbWR0dW5seHZ2d2V5emJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzODcxNDYsImV4cCI6MjA4Mzk2MzE0Nn0.YK8bWmMWC2XXjdO0qqQ9YWdKdP2AOCPfdyoYw1L0FPw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Check if institution exists
  const { data: existingInstitution } = await supabase
    .from('institutions')
    .select('id')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (!existingInstitution) {
    console.log('Creating default institution...');
    const { error } = await supabase
      .from('institutions')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Default Institution',
        short_name: 'DEFAULT',
      });

    if (error) {
      console.error('❌ Error creating institution:', error);
      process.exit(1);
    }
    console.log('✅ Default institution created');
  } else {
    console.log('✅ Default institution already exists');
  }

  console.log('🎉 Database seeding complete!');
}

seedDatabase().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
