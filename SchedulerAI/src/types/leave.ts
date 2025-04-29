export type Leave = {
  leave_id: number;
  user_id: number;
  leave_type: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_id: number | null;
  request_timestamp: string;
};

// Helper type for database row
export type LeaveRequestRow = {
  leave_id: number;
  user_id: number;
  leave_type: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  status: string;
  approver_id: number | null;
  request_timestamp: string;
}; 