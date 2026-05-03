import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Item = {
  id: string;
  asset_name: string;
  raw_title: string | null;
  asset_tag: string | null;
  category: string | null;
  status: string | null;
  team_name: string | null;
  notes: string | null;
  created_at: string | null;
};
