import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nvddccrdlesgpddzwacq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZGRjY3JkbGVzZ3BkZHp3YWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjg2ODQsImV4cCI6MjA5NzYwNDY4NH0.uI4Xg3mjxoo0EYMMcg0UsV7B0hGJAF4Cf7L2H222mAM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
