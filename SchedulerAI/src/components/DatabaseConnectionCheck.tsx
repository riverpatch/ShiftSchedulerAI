import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Check, X } from 'lucide-react';
import type { Database } from '@/lib/supabase/client';

type TableNames = keyof Database['public']['Tables'];
type TableStatusType = 'checking' | 'connected' | 'error';

interface TableStatus {
  name: TableNames;
  status: TableStatusType;
  recordCount?: number;
  error?: string;
}

const DatabaseConnectionCheck = () => {
  const [tables, setTables] = useState<TableStatus[]>([
    { name: 'users', status: 'checking' },
    { name: 'attendance', status: 'checking' },
    { name: 'leave_requests', status: 'checking' },
    { name: 'shift_schedule', status: 'checking' },
    { name: 'shift_swap_requests', status: 'checking' },
    { name: 'messages', status: 'checking' },
    { name: 'notifications', status: 'checking' }
  ]);

  useEffect(() => {
    const checkTables = async () => {
      const updatedTables = await Promise.all(
        tables.map(async (table) => {
          try {
            const query = supabase.from(table.name).select('*');
            const { data, error } = await query;

            if (error) {
              return {
                ...table,
                status: 'error' as TableStatusType,
                error: error.message
              };
            }

            return {
              ...table,
              status: 'connected' as TableStatusType,
              recordCount: data?.length || 0
            };
          } catch (error) {
            return {
              ...table,
              status: 'error' as TableStatusType,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      setTables(updatedTables);
    };

    checkTables();
  }, []);

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Database Connection Status</h3>
        <span className="text-sm text-gray-500">Live</span>
      </div>
      <div className="space-y-2">
        {tables.map((table) => (
          <div key={table.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">{table.name}</span>
              {table.status === 'connected' && table.recordCount !== undefined && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {table.recordCount} records
                </span>
              )}
            </div>
            <div className="flex items-center">
              {table.status === 'checking' && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              {table.status === 'connected' && (
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="ml-2 text-xs text-green-600">connected</span>
                </div>
              )}
              {table.status === 'error' && (
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="ml-2 text-sm text-red-500">{table.error}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseConnectionCheck; 