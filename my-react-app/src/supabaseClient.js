import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iussaudazomnbddkaljc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1c3NhdWRhem9tbmJkZGthbGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NTk5MzgsImV4cCI6MjA4ODIzNTkzOH0.kkQJ35fKK6lSyOayBQUdCxBvOmyaWvyNWi9HZCeUTXM'

export const supabase = createClient(supabaseUrl, supabaseKey)