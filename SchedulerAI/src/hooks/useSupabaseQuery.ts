import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type TableNames = keyof Tables;
type TableData<T extends TableNames> = Tables[T]['Row'][];

export function useSupabaseQuery<T extends TableNames>(
  tableName: T,
  options: {
    select?: string;
    filters?: { column: string; value: any }[];
    orderBy?: { column: string; ascending?: boolean };
  } = {}
) {
  const [data, setData] = useState<TableData<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Start building the query
        let query = supabase.from(tableName).select(options.select || '*');

        // Apply filters if any
        if (options.filters) {
          options.filters.forEach(({ column, value }) => {
            query = query.eq(column, value);
          });
        }

        // Apply ordering if specified
        if (options.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true,
          });
        }

        const { data: result, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        if (!result) {
          setData([]);
          return;
        }

        // Safe type assertion since we know the shape matches our Database type
        setData(result as unknown as TableData<T>);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, JSON.stringify(options)]);

  return { data, loading, error };
} 