import { supabase } from '@/integrations/supabase/client';
import type { Leave, LeaveRequestRow } from '@/types/leave';

// Conversion helper for Leave
function convertLeave(row: LeaveRequestRow): Leave {
  return {
    leave_id: row.leave_id,
    user_id: row.user_id,
    leave_type: row.leave_type,
    start_datetime: row.start_datetime,
    end_datetime: row.end_datetime,
    reason: row.reason,
    status: row.status as 'pending' | 'approved' | 'rejected',
    approver_id: row.approver_id,
    request_timestamp: row.request_timestamp,
  };
}

// Fetch all leave requests
export async function getLeaveRequests(): Promise<Leave[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*') as { data: LeaveRequestRow[] | null; error: any };
  if (error) throw error;
  return Array.isArray(data) ? data.map(convertLeave) : [];
}

// Approve a leave request
export async function approveLeave(leaveId: number): Promise<Leave> {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status: 'approved' })
    .eq('leave_id', leaveId)
    .select()
    .single() as { data: LeaveRequestRow | null; error: any };
  if (error) throw error;
  return convertLeave(data!);
}

// Reject a leave request
export async function rejectLeave(leaveId: number): Promise<Leave> {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status: 'rejected' })
    .eq('leave_id', leaveId)
    .select()
    .single() as { data: LeaveRequestRow | null; error: any };
  if (error) throw error;
  return convertLeave(data!);
}
