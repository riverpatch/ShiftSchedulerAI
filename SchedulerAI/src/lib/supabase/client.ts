import { createClient } from '@supabase/supabase-js';

// ---------------------------------------
// Supabase Types
// ---------------------------------------
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database schema types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number;
          email: string;
          password_hash: string;
          role: UserRole;
          name: string;
          priority_level: number | null;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: number;
          email: string;
          password_hash: string;
          role: UserRole;
          name: string;
          priority_level?: number | null;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: number;
          email?: string;
          password_hash?: string;
          role?: UserRole;
          name?: string;
          priority_level?: number | null;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          attendance_id: number;
          user_id: number;
          date: string;
          clock_in_time: string | null;
          clock_out_time: string | null;
          status: AttendanceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          attendance_id?: number;
          user_id: number;
          date: string;
          clock_in_time?: string | null;
          clock_out_time?: string | null;
          status: AttendanceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          attendance_id?: number;
          user_id?: number;
          date?: string;
          clock_in_time?: string | null;
          clock_out_time?: string | null;
          status?: AttendanceStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      leave_requests: {
        Row: {
          leave_id: number;
          user_id: number;
          leave_type: LeaveType;
          start_datetime: string;
          end_datetime: string;
          reason: string | null;
          status: RequestStatus;
          approver_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          leave_id?: number;
          user_id: number;
          leave_type: LeaveType;
          start_datetime: string;
          end_datetime: string;
          reason?: string | null;
          status?: RequestStatus;
          approver_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          leave_id?: number;
          user_id?: number;
          leave_type?: LeaveType;
          start_datetime?: string;
          end_datetime?: string;
          reason?: string | null;
          status?: RequestStatus;
          approver_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shift_schedule: {
        Row: {
          shift_id: number;
          user_id: number;
          date: string;
          shift_start_time: string;
          shift_end_time: string;
          assignment_type: AssignmentType;
          shift_status: ShiftStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          shift_id?: number;
          user_id: number;
          date: string;
          shift_start_time: string;
          shift_end_time: string;
          assignment_type: AssignmentType;
          shift_status?: ShiftStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          shift_id?: number;
          user_id?: number;
          date?: string;
          shift_start_time?: string;
          shift_end_time?: string;
          assignment_type?: AssignmentType;
          shift_status?: ShiftStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      shift_swap_requests: {
        Row: {
          swap_id: number;
          requester_user_id: number;
          requested_user_id: number | null;
          shift_id: number;
          swap_reason: string | null;
          ai_suggested: boolean;
          status: RequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          swap_id?: number;
          requester_user_id: number;
          requested_user_id?: number | null;
          shift_id: number;
          swap_reason?: string | null;
          ai_suggested?: boolean;
          status?: RequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          swap_id?: number;
          requester_user_id?: number;
          requested_user_id?: number | null;
          shift_id?: number;
          swap_reason?: string | null;
          ai_suggested?: boolean;
          status?: RequestStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          message_id: number;
          sender_id: number;
          recipient_id: number;
          subject: string | null;
          body: string;
          channel: ChannelType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          message_id?: number;
          sender_id: number;
          recipient_id: number;
          subject?: string | null;
          body: string;
          channel: ChannelType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          message_id?: number;
          sender_id?: number;
          recipient_id?: number;
          subject?: string | null;
          body?: string;
          channel?: ChannelType;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          notification_id: number;
          user_id: number;
          type: NotificationType;
          content: string;
          read_status: ReadStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          notification_id?: number;
          user_id: number;
          type: NotificationType;
          content: string;
          read_status?: ReadStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          notification_id?: number;
          user_id?: number;
          type?: NotificationType;
          content?: string;
          read_status?: ReadStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Enum types
export type UserRole = 'Owner' | 'Employee';
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'emergency';
export type LeaveType = 'Full Day' | 'Half Day' | 'Hourly';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type AssignmentType = 'manual' | 'ai-generated';
export type ShiftStatus = 'assigned' | 'swapped' | 'emergency';
export type NotificationType = 'schedule_update' | 'emergency_alert' | 'message';
export type ChannelType = 'email' | 'in-app';
export type ReadStatus = 'unread' | 'read';
export type UserStatus = 'active' | 'inactive';

// ---------------------------------------
// Supabase Client Setup
// ---------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Configuration constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 10000; // 10 seconds

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
  
  // Enhanced query method with retry logic
  from: (table: keyof Database['public']['Tables']) => {
    const originalFrom = baseClient.from(table);
    
    return {
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
  }
}; 