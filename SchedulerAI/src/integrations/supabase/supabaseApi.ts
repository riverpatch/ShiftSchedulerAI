import { supabase } from './client';
import { Database } from './types';
import { Leave } from '@/types/leave';

// Helper function to convert database leave request to our Leave type
const convertLeaveRequest = (dbLeave: Database['public']['Tables']['leave_requests']['Row']): Leave => ({
  leave_id: Number(dbLeave.id),
  user_id: Number(dbLeave.employee_id),
  leave_type: dbLeave.type,
  start_datetime: dbLeave.start_date,
  end_datetime: dbLeave.end_date,
  reason: dbLeave.reason || '',
  status: (dbLeave.status || 'pending') as 'pending' | 'approved' | 'rejected',
  approver_id: null,
  request_timestamp: dbLeave.submitted_at || new Date().toISOString()
});

// Fetch all leave requests
export const fetchLeaveRequests = async (): Promise<Leave[]> => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .order('submitted_at', { ascending: false }) as { data: Database['public']['Tables']['leave_requests']['Row'][] | null; error: any };

  if (error) {
    console.error('Error fetching leave requests:', error);
    throw new Error('Failed to fetch leave requests');
  }

  return (data || []).map(convertLeaveRequest);
};

// Create a new leave request
export const createLeaveRequest = async (leaveRequest: Omit<Leave, 'leave_id' | 'request_timestamp'>): Promise<Leave> => {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([{
      employee_id: String(leaveRequest.user_id),
      type: leaveRequest.leave_type,
      start_date: leaveRequest.start_datetime,
      end_date: leaveRequest.end_datetime,
      reason: leaveRequest.reason,
      status: leaveRequest.status,
      submitted_at: new Date().toISOString()
    }])
    .select()
    .single() as { data: Database['public']['Tables']['leave_requests']['Row'] | null; error: any };

  if (error) {
    console.error('Error creating leave request:', error);
    throw new Error('Failed to create leave request');
  }

  if (!data) {
    throw new Error('No data returned after creating leave request');
  }

  return convertLeaveRequest(data);
};

// Update a leave request
export const updateLeaveRequest = async (leaveId: number, updates: Partial<Leave>): Promise<Leave> => {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      type: updates.leave_type,
      start_date: updates.start_datetime,
      end_date: updates.end_datetime,
      reason: updates.reason,
      status: updates.status
    })
    .eq('id', String(leaveId))
    .select()
    .single() as { data: Database['public']['Tables']['leave_requests']['Row'] | null; error: any };

  if (error) {
    console.error('Error updating leave request:', error);
    throw new Error('Failed to update leave request');
  }

  if (!data) {
    throw new Error('No data returned after updating leave request');
  }

  return convertLeaveRequest(data);
};

// Delete a leave request
export const deleteLeaveRequest = async (leaveId: number): Promise<void> => {
  const { error } = await supabase
    .from('leave_requests')
    .delete()
    .eq('id', String(leaveId)) as { error: any };

  if (error) {
    console.error('Error deleting leave request:', error);
    throw new Error('Failed to delete leave request');
  }
}; 