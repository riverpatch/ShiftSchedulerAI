// types.ts - Supabase schema and shared data models for AI Shift Scheduler

// -------------------------
// Supabase Database Schema
// -------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      employee_shifts: {
        Row: {
          assigned_at: string | null;
          employee_id: string;
          id: string;
          shift_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          employee_id: string;
          id?: string;
          shift_id: string;
        };
        Update: {
          assigned_at?: string | null;
          employee_id?: string;
          id?: string;
          shift_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_shifts_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_shifts_shift_id_fkey";
            columns: ["shift_id"];
            isOneToOne: false;
            referencedRelation: "shifts";
            referencedColumns: ["id"];
          }
        ];
      };
      employees: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          priority: number;
          role: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          priority?: number;
          role?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          priority?: number;
          role?: string;
        };
        Relationships: [];
      };
      leave_requests: {
        Row: {
          employee_id: string;
          end_date: string;
          id: string;
          reason: string | null;
          start_date: string;
          status: string;
          submitted_at: string | null;
          type: string;
        };
        Insert: {
          employee_id: string;
          end_date: string;
          id?: string;
          reason?: string | null;
          start_date: string;
          status?: string;
          submitted_at?: string | null;
          type: string;
        };
        Update: {
          employee_id?: string;
          end_date?: string;
          id?: string;
          reason?: string | null;
          start_date?: string;
          status?: string;
          submitted_at?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      shift_schedule_runs: {
        Row: {
          id: string;
          info: Json | null;
          run_at: string | null;
          run_type: string;
        };
        Insert: {
          id?: string;
          info?: Json | null;
          run_at?: string | null;
          run_type?: string;
        };
        Update: {
          id?: string;
          info?: Json | null;
          run_at?: string | null;
          run_type?: string;
        };
        Relationships: [];
      };
      shifts: {
        Row: {
          created_at: string | null;
          date: string;
          end_time: string;
          id: string;
          position: string;
          start_time: string;
          status: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          end_time: string;
          id?: string;
          position: string;
          start_time: string;
          status?: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          end_time?: string;
          id?: string;
          position?: string;
          start_time?: string;
          status?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          user_id: number;
          email: string;
          password_hash: string;
          role: string;
          name: string;
          priority_level: number | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id?: number;
          email: string;
          password_hash: string;
          role: string;
          name: string;
          priority_level?: number | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: number;
          email?: string;
          password_hash?: string;
          role?: string;
          name?: string;
          priority_level?: number | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      shift_schedule: {
        Row: {
          id: string;
          user_id: string;
          shift_start_time: string;
          shift_end_time: string;
          shift_status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          shift_start_time: string;
          shift_end_time: string;
          shift_status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          shift_start_time?: string;
          shift_end_time?: string;
          shift_status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shift_schedule_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

// ---------------------------------------
// Domain models & shared interfaces
// ---------------------------------------

export type UUID = string;
export type DateTime = string; // ISO 8601 timestamp string

export enum Role {
  Owner = "owner",
  Employee = "employee",
}

export interface Company {
  companyId: UUID;
  name: string;
  description?: string;
  totalEmployees: number;
}

export interface Employee {
  employeeId: UUID;
  companyId: UUID;
  name: string;
  department: string;
  daysPerWeek: number;
  hoursPerDay: number;
  priority: number;
  username: string;
  passwordHash: string;
  role: Role;
}

export enum ShiftStatus {
  Scheduled = "scheduled",
  Completed = "completed",
  Cancelled = "cancelled",
}

export interface Shift {
  shiftId: UUID;
  companyId: UUID;
  employeeId: UUID;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: ShiftStatus;
}

export enum LeaveType {
  Future = "future",
  Emergency = "emergency",
}

export enum RequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface LeaveRequest {
  requestId: UUID;
  employeeId: UUID;
  fromDateTime: DateTime;
  toDateTime: DateTime;
  type: LeaveType;
  status: RequestStatus;
  aiSuggestionId?: UUID;
  submittedAt?: DateTime;
}

export enum AISuggestionAction {
  Swap = "swap",
  Reassign = "reassign",
  Reject = "reject",
}

export interface AISuggestion {
  suggestionId: UUID;
  requestId: UUID;
  recommendedAction: AISuggestionAction;
  recommendedEmployeeId?: UUID;
  reason: string;
}

export enum NotificationChannel {
  Email = "email",
  Push = "push",
}

export interface Notification {
  notificationId: UUID;
  recipientId: UUID;
  channel: NotificationChannel;
  content: string;
  sentAt?: DateTime;
}

export interface HistoryEntry {
  id: UUID;
  entity: string;
  entityId: UUID;
  action: string;
  performedBy: UUID;
  performedAt: DateTime;
  details?: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  user_role: string;
  priority_level: number;
  created_at: string | null;
  updated_at: string | null;
}
