import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type TableStatus = {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  count?: number;
};

export const DatabaseConnections: React.FC = () => {
  const [tables, setTables] = React.useState<TableStatus[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkConnections = async () => {
      try {
        const tablesToCheck: (keyof Database['public']['Tables'])[] = [
          'users',
          'attendance',
          'leave_requests',
          'shift_schedule',
          'shift_swap_requests',
          'messages',
          'notifications'
        ];

        const results = await Promise.all(
          tablesToCheck.map(async (tableName) => {
            try {
              console.log(`Checking table: ${tableName}`);
              const { data, error, count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact' });
              
              if (error) {
                console.error(`Error fetching ${tableName}:`, error);
                return {
                  name: tableName,
                  status: 'error' as const
                };
              }

              console.log(`${tableName} data:`, data);
              console.log(`${tableName} count:`, count);
              
              return {
                name: tableName,
                status: 'connected' as const,
                count: count || 0
              };
            } catch (error) {
              console.error(`Error with ${tableName}:`, error);
              return {
                name: tableName,
                status: 'error' as const
              };
            }
          })
        );

        console.log('All table results:', results);
        setTables(results);
      } catch (error) {
        console.error('Error checking database connections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnections();
  }, []);

  const getStatusColor = (status: TableStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Database Connections</span>
          <Badge variant="outline" className={isLoading ? 'animate-pulse' : ''}>
            {isLoading ? 'Checking...' : 'Live'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tables.map((table) => (
            <div
              key={table.name}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(table.status)}`} />
                <span className="font-medium capitalize">{table.name.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                {table.count !== undefined && (
                  <Badge variant="secondary">{table.count} records</Badge>
                )}
                <Badge variant={table.status === 'connected' ? 'default' : 'destructive'}>
                  {table.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 