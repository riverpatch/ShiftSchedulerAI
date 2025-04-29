import React from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import type { Database } from '@/lib/supabase/client';

type Tables = Database['public']['Tables'];
type TableNames = keyof Tables;

interface DataTableProps<T extends TableNames> {
  tableName: T;
  columns: Array<{
    key: keyof Tables[T]['Row'];
    header: string;
  }>;
  filters?: { column: string; value: any }[];
  orderBy?: { column: string; ascending?: boolean };
}

export function DataTable<T extends TableNames>({
  tableName,
  columns,
  filters,
  orderBy,
}: DataTableProps<T>) {
  const { data, loading, error } = useSupabaseQuery(tableName, { filters, orderBy });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 