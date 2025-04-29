import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export type TypedSupabaseClient = SupabaseClient<Database> & {
  from: <T extends keyof Database['public']['Tables']>(
    table: T
  ) => {
    select: (columns?: string) => {
      eq: (column: string, value: any) => Promise<{
        data: Database['public']['Tables'][T]['Row'][];
        error: null | { message: string; details: string; hint: string };
      }>;
      single: () => Promise<{
        data: Database['public']['Tables'][T]['Row'] | null;
        error: null | { message: string; details: string; hint: string };
      }>;
    };
    update: (values: Partial<Database['public']['Tables'][T]['Row']>) => {
      eq: (column: string, value: any) => Promise<{
        data: Database['public']['Tables'][T]['Row'] | null;
        error: null | { message: string; details: string; hint: string };
      }>;
    };
  };
}; 