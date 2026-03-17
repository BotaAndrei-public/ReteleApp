import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkmwubrapnpvjpnguxgo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprbXd1YnJhcG5wdmpwbmd1eGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODAwNTYsImV4cCI6MjA4OTM1NjA1Nn0.cRGuHbzPnBPSDZ99AikTsAs113uKpZeokz6k7L83AFg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
