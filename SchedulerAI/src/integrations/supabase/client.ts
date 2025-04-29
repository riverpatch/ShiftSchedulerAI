// ---------------------------------------
// Supabase client instantiation
// ---------------------------------------
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Configuration constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Connection status tracking
let isConnected = false;
let connectionAttempts = 0;

// Custom error class for Supabase operations
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Retry wrapper for Supabase operations
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const result = await Promise.race([
      operation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      )
    ]);
    return result as T;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

// Create the base client
const baseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'scheduler-ai'
    }
  }
});

// Enhanced client with retry and error handling
export const supabase = {
  ...baseClient,
  
  // Enhanced query method
  from: (table: keyof Database['public']['Tables']) => {
    const originalFrom = baseClient.from(table);
    
    // Wrap the original builder's methods with retry logic
    const enhancedBuilder = {
      ...originalFrom,
      select: (query?: string) => {
        const builder = originalFrom.select(query);
        const originalThen = builder.then;
        builder.then = async (onFulfilled: any, onRejected: any) => {
          try {
            const result = await withRetry(() => originalThen.call(builder));
            return onFulfilled(result);
          } catch (error) {
            return onRejected(new SupabaseError(
              error instanceof Error ? error.message : 'Unknown error occurred',
              'QUERY_ERROR',
              error
            ));
          }
        };
        return builder;
      },
      
      insert: (values: any) => {
        const builder = originalFrom.insert(values);
        const originalThen = builder.then;
        builder.then = async (onFulfilled: any, onRejected: any) => {
          try {
            const result = await withRetry(() => originalThen.call(builder));
            return onFulfilled(result);
          } catch (error) {
            return onRejected(new SupabaseError(
              error instanceof Error ? error.message : 'Unknown error occurred',
              'INSERT_ERROR',
              error
            ));
          }
        };
        return builder;
      },
      
      update: (values: any) => {
        const builder = originalFrom.update(values);
        const originalThen = builder.then;
        builder.then = async (onFulfilled: any, onRejected: any) => {
          try {
            const result = await withRetry(() => originalThen.call(builder));
            return onFulfilled(result);
          } catch (error) {
            return onRejected(new SupabaseError(
              error instanceof Error ? error.message : 'Unknown error occurred',
              'UPDATE_ERROR',
              error
            ));
          }
        };
        return builder;
      },
      
      delete: () => {
        const builder = originalFrom.delete();
        const originalThen = builder.then;
        builder.then = async (onFulfilled: any, onRejected: any) => {
          try {
            const result = await withRetry(() => originalThen.call(builder));
            return onFulfilled(result);
          } catch (error) {
            return onRejected(new SupabaseError(
              error instanceof Error ? error.message : 'Unknown error occurred',
              'DELETE_ERROR',
              error
            ));
          }
        };
        return builder;
      }
    };

    return enhancedBuilder;
  },
  
  // Connection status methods
  getConnectionStatus: () => isConnected,
  
  // Reconnect method
  reconnect: async () => {
    try {
      connectionAttempts++;
      const { data, error } = await baseClient.auth.getSession();
      if (error) throw error;
      isConnected = true;
      connectionAttempts = 0;
      return { success: true, data };
    } catch (error) {
      isConnected = false;
      return { 
        success: false, 
        error: new SupabaseError(
          'Failed to reconnect to Supabase',
          'RECONNECT_ERROR',
          error
        )
      };
    }
  }
};

// Initialize connection monitoring
const monitorConnection = async () => {
  try {
    const { data, error } = await baseClient.auth.getSession();
    if (error) throw error;
    isConnected = true;
    connectionAttempts = 0;
  } catch (error) {
    isConnected = false;
    console.error('Supabase connection error:', error);
  }
};

// Start connection monitoring
monitorConnection();

// Set up periodic connection check
setInterval(monitorConnection, 30000); // Check every 30 seconds
