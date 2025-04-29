import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tableStatus, setTableStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check if tables exist
        const tables = [
          'users',
          'shift_schedule',
          'leave_requests',
          'attendance',
          'shift_swap_requests',
          'messages',
          'notifications',
        ];
        const tableStatus: Record<string, boolean> = {};

        for (const table of tables) {
          try {
            const { error } = await supabase.from(table as any).select('*').limit(1);
            tableStatus[table] = !error;
          } catch (e) {
            tableStatus[table] = false;
          }
        }

        setTableStatus(tableStatus);
        setConnectionStatus('success');
      } catch (err) {
        setConnectionStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      <div className="space-y-4">
        <div>
          <p>Connection Status:
            <span className={`ml-2 font-semibold ${
              connectionStatus === 'success' ? 'text-green-600' :
              connectionStatus === 'error' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {connectionStatus.toUpperCase()}
            </span>
          </p>
          {error && (
            <p className="text-red-600 mt-2">Error: {error}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Table Status:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(tableStatus).map(([table, exists]) => (
              <div key={table} className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  exists ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-mono">{table}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {exists ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {!Object.values(tableStatus).some(exists => exists) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              Tables not found. Please ensure your Supabase schema matches your app's requirements.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              Go to: Supabase Dashboard → Table Editor to verify or create tables as needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 