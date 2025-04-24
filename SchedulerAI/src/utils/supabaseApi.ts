
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Fetch all employees (optionally filter by role)
export async function getEmployees(role?: string) {
  let query = supabase.from('employees').select('*');
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) throw error;
  return data as Tables<'employees'>[];
}

// Fetch all shifts
export async function getShifts() {
  const { data, error } = await supabase.from('shifts').select('*');
  if (error) throw error;
  return data as Tables<'shifts'>[];
}

// Fetch all employee_shifts
export async function getEmployeeShifts(employeeId: string) {
  const { data, error } = await supabase
    .from('employee_shifts')
    .select('*, shift:shifts(*)')
    .eq('employee_id', employeeId);
  if (error) throw error;
  return data;
}

// Fetch all leave requests
export async function getLeaveRequests() {
  const { data, error } = await supabase.from('leave_requests').select('*');
  if (error) throw error;
  return data as Tables<'leave_requests'>[];
}

// Approve a leave request
export async function approveLeave(leaveId: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status: 'Approved' })
    .eq('id', leaveId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Reject a leave request
export async function rejectLeave(leaveId: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status: 'Rejected' })
    .eq('id', leaveId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Assign employees to a shift
export async function assignShift(shiftId: string, employeeIds: string[]) {
  // First, remove any existing assignments for this shift:
  await supabase.from('employee_shifts').delete().eq('shift_id', shiftId);
  // Next, assign shift to employeeIds
  const rows = employeeIds.map(employee_id => ({
    shift_id: shiftId,
    employee_id,
  }));
  const { data, error } = await supabase.from('employee_shifts').insert(rows).select();
  if (error) throw error;
  return data;
}
