
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Type definitions matching Supabase schema
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Employee';
  priority: number;
  avatarUrl?: string;
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
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Emergency';
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  submitted_at: string;
};

export type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  employeeIds: string[];
  position: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Unassigned';
};

// Mock data for when not connected to Supabase
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'owner@example.com',
    role: 'Owner',
    priority: 5
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'employee@example.com',
    role: 'Employee',
    priority: 3
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Employee',
    priority: 4
  }
];

export const shifts: Shift[] = [
  {
    id: 'shift-1',
    date: '2025-04-22',
    startTime: '09:00',
    endTime: '17:00',
    employeeIds: ['2'],
    position: 'Floor Staff',
    status: 'Scheduled'
  },
  {
    id: 'shift-2',
    date: '2025-04-22',
    startTime: '17:00',
    endTime: '01:00',
    employeeIds: ['3'],
    position: 'Floor Staff',
    status: 'Scheduled'
  },
  {
    id: 'shift-3',
    date: '2025-04-23',
    startTime: '09:00',
    endTime: '17:00',
    employeeIds: ['2', '3'],
    position: 'Floor Staff',
    status: 'Scheduled'
  }
];

// Update the mock leaves data to match the snake_case Leave type
export const leaves: Leave[] = [
  {
    id: 'leave-1',
    employee_id: '2',
    start_date: '2025-04-24',
    end_date: '2025-04-25',
    type: 'Vacation',
    status: 'Approved',
    reason: 'Family vacation',
    submitted_at: '2025-04-15T10:00:00Z'
  },
  {
    id: 'leave-2',
    employee_id: '3',
    start_date: '2025-04-26',
    end_date: '2025-04-26',
    type: 'Personal',
    status: 'Pending',
    reason: 'Appointment',
    submitted_at: '2025-04-16T14:30:00Z'
  }
];

// Functions to fetch data (used by components)
export const fetchEmployees = async (): Promise<User[]> => {
  try {
    const { data: employees } = await supabase.from('employees').select('*');
    
    if (employees && employees.length > 0) {
      return employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role as 'Owner' | 'Employee',
        priority: emp.priority,
        avatarUrl: emp.avatar_url
      }));
    }
    
    // Return mock data if no Supabase data
    return users;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return users;
  }
};

export const fetchShifts = async (): Promise<Shift[]> => {
  try {
    const { data: shiftsData } = await supabase.from('shifts').select('*');
    const { data: employeeShifts } = await supabase.from('employee_shifts').select('*');
    
    if (shiftsData && shiftsData.length > 0) {
      return shiftsData.map(shift => {
        // Find all employees assigned to this shift
        const assignedEmployeeIds = employeeShifts
          ? employeeShifts
              .filter(es => es.shift_id === shift.id)
              .map(es => es.employee_id)
          : [];
        
        return {
          id: shift.id,
          date: shift.date,
          startTime: shift.start_time,
          endTime: shift.end_time,
          employeeIds: assignedEmployeeIds,
          position: shift.position,
          status: shift.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Unassigned'
        };
      });
    }
    
    // Return mock data if no Supabase data
    return shifts;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return shifts;
  }
};

export const fetchLeaves = async (): Promise<Leave[]> => {
  try {
    const { data: leavesData } = await supabase.from('leave_requests').select('*');
    
    if (leavesData && leavesData.length > 0) {
      // Already in snake_case format from the database
      return leavesData as Leave[];
    }
    
    // Return mock data if no Supabase data
    return leaves;
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return leaves;
  }
};

export const getShiftsByEmployeeId = (employeeId: string): Shift[] => {
  return shifts.filter(shift => shift.employeeIds.includes(employeeId));
};

export const getLeavesByEmployeeId = (employeeId: string): Leave[] => {
  return leaves.filter(leave => leave.employee_id === employeeId);
};

export const getPendingLeaves = (): Leave[] => {
  return leaves.filter(leave => leave.status === 'Pending');
};

export const getUnassignedShifts = (): Shift[] => {
  return shifts.filter(shift => shift.employeeIds.length === 0 || shift.status === 'Unassigned');
};

// Function to convert Supabase types to frontend types
export const convertSupabaseEmployee = (employee: Tables<'employees'>): User => {
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role as 'Owner' | 'Employee',
    priority: employee.priority,
    avatarUrl: employee.avatar_url || undefined
  };
};

export const convertSupabaseLeave = (leave: Tables<'leave_requests'>): Leave => {
  return {
    id: leave.id,
    employee_id: leave.employee_id,
    start_date: leave.start_date,
    end_date: leave.end_date,
    type: leave.type as 'Vacation' | 'Sick' | 'Personal' | 'Emergency',
    status: leave.status as 'Pending' | 'Approved' | 'Rejected',
    reason: leave.reason || '',
    submitted_at: leave.submitted_at || new Date().toISOString()
  };
};

export const convertSupabaseShift = (
  shift: Tables<'shifts'>, 
  employeeIds: string[] = []
): Shift => {
  return {
    id: shift.id,
    date: shift.date,
    startTime: shift.start_time,
    endTime: shift.end_time,
    position: shift.position,
    status: shift.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Unassigned',
    employeeIds
  };
};
