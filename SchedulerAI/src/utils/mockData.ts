import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions matching new users schema
export type User = {
  user_id: number;
  email: string;
  password_hash?: string;
  role: string;
  name: string;
  priority_level: number;
  status?: string;
};

// Original camelCase version (for internal use)
export type LeaveOriginal = {
  id: string;
  employeeId: string; 
  startDate: string;  
  endDate: string;    
  type: 'Vacation' | 'Sick' | 'Personal' | 'Emergency';
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  submittedAt: string; 
};

// Snake_case version to match what LeaveRequestList component expects
export type Leave = {
  leave_id: number;
  user_id: number;
  leave_type: 'Full Day' | 'Half Day' | 'Hourly';
  start_datetime: string;
  end_datetime: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_id?: number;
  request_timestamp?: string;
};

// Update Shift type to match new schema
export type Shift = {
  shift_id: number;
  user_id: number;
  date: string;
  shift_start_time: string;
  shift_end_time: string;
  assignment_type: 'manual' | 'ai-generated';
  shift_status: 'assigned' | 'swapped' | 'emergency';
};

// Mock data for when not connected to Supabase
export const users: User[] = [
  {
    user_id: 1,
    email: 'owner@example.com',
    password_hash: 'hashed_pw_1',
    role: 'Owner',
    name: 'John Doe',
    priority_level: 1,
    status: 'active'
  },
  {
    user_id: 2,
    email: 'employee1@example.com',
    password_hash: 'hashed_pw_2',
    role: 'Employee',
    name: 'Jane Smith',
    priority_level: 2,
    status: 'active'
  },
  {
    user_id: 3,
    email: 'employee2@example.com',
    password_hash: 'hashed_pw_3',
    role: 'Employee',
    name: 'Bob Johnson',
    priority_level: 3,
    status: 'active'
  }
];

// Update mock shifts data
export const shifts: Shift[] = [
  {
    shift_id: 1,
    user_id: 2,
    date: '2025-04-22',
    shift_start_time: '09:00',
    shift_end_time: '17:00',
    assignment_type: 'manual',
    shift_status: 'assigned'
  },
  {
    shift_id: 2,
    user_id: 3,
    date: '2025-04-22',
    shift_start_time: '17:00',
    shift_end_time: '01:00',
    assignment_type: 'manual',
    shift_status: 'assigned'
  },
  {
    shift_id: 3,
    user_id: 2,
    date: '2025-04-23',
    shift_start_time: '09:00',
    shift_end_time: '17:00',
    assignment_type: 'ai-generated',
    shift_status: 'assigned'
  }
];

// Update the mock leaves data to match the snake_case Leave type
export const leaves: Leave[] = [
  {
    leave_id: 1,
    user_id: 2,
    leave_type: 'Full Day',
    start_datetime: '2025-04-24T09:00:00Z',
    end_datetime: '2025-04-25T17:00:00Z',
    reason: 'Family vacation',
    status: 'approved',
    approver_id: 1,
    request_timestamp: '2025-04-15T10:00:00Z'
  },
  {
    leave_id: 2,
    user_id: 3,
    leave_type: 'Half Day',
    start_datetime: '2025-04-26T09:00:00Z',
    end_datetime: '2025-04-26T13:00:00Z',
    reason: 'Appointment',
    status: 'pending',
    approver_id: 1,
    request_timestamp: '2025-04-16T14:30:00Z'
  }
];

// Functions to fetch data (used by components)
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const result = await supabase.from('users').select('*');
    const { data: usersData } = result as { data: any[] | null };
    if (usersData && usersData.length > 0) {
      return usersData.map(convertUser);
    }
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return users;
  }
};

// Update fetchShifts to match new schema
export const fetchShifts = async (): Promise<Shift[]> => {
  try {
    const result = await supabase.from('shift_schedule').select('*');
    const { data: shiftsData } = result as { data: any[] | null };
    if (shiftsData && shiftsData.length > 0) {
      return shiftsData.map(convertShift);
    }
    return shifts;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return shifts;
  }
};

// Update fetchLeaves to use 'leave_requests' table
export const fetchLeaves = async (): Promise<Leave[]> => {
  try {
    const result = await supabase.from('leave_requests').select('*');
    const { data: leavesData } = result as { data: any[] | null };
    if (leavesData && leavesData.length > 0) {
      return leavesData.map(convertLeave);
    }
    return leaves;
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return leaves;
  }
};

export const getShiftsByUserId = (userId: number): Shift[] => {
  return shifts.filter(shift => shift.user_id === userId);
};

export const getLeavesByUserId = (userId: number): Leave[] => {
  return leaves.filter(leave => leave.user_id === userId);
};

export const getPendingLeaves = (): Leave[] => {
  return leaves.filter(leave => leave.status === 'pending');
};

export const getUnassignedShifts = (): Shift[] => {
  return shifts.filter(shift => shift.user_id === 0 || shift.shift_status === 'emergency');
};

// Function to convert a user row to User type
export const convertUser = (user: any): User => ({
  user_id: user.user_id,
  email: user.email,
  password_hash: user.password_hash,
  role: user.role,
  name: user.name,
  priority_level: user.priority_level,
  status: user.status
});

export const convertLeave = (leave: any): Leave => {
  return {
    leave_id: leave.leave_id,
    user_id: leave.user_id,
    leave_type: leave.leave_type,
    start_datetime: leave.start_datetime,
    end_datetime: leave.end_datetime,
    reason: leave.reason,
    status: leave.status,
    approver_id: leave.approver_id,
    request_timestamp: leave.request_timestamp
  };
};

export const convertShift = (shift: any): Shift => {
  return {
    shift_id: shift.shift_id,
    user_id: shift.user_id,
    date: shift.date,
    shift_start_time: shift.shift_start_time,
    shift_end_time: shift.shift_end_time,
    assignment_type: shift.assignment_type,
    shift_status: shift.shift_status
  };
};
