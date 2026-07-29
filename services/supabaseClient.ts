import { createClient } from '@supabase/supabase-js';

// Hardcoded based on user request
const SUPABASE_URL = 'https://bwbviufipfikhbaxcaej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3YnZpdWZpcGZpa2hiYXhjYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzkxODAsImV4cCI6MjA4MTgxNTE4MH0.gieShx_RhM-2jhtP9n8Zv4iXFjpgHNfcdf4XpfYODLk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Disabled to ensure user is logged out on page refresh
    storageKey: 'supabase-session-aayush',
  },
});

export const ALLOWED_EMAIL = "aayushbaral.abb@gmail.com";
export const STORAGE_BUCKET = 'personal-documents';