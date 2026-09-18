import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type ToolType = "error_decoder" | "project_planner" | "code_review" | "doc_generator";

export interface HistoryItem {
  id: string;
  user_id: string;
  tool_type: ToolType;
  input_text: string;
  output_data: Record<string, unknown>;
  title: string;
  created_at: string;
}
