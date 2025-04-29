import React, { useState } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Leave } from '@/types/leave';

interface Employee {
  id: string;
  name: string;
  email: string;
  priority: number;
}

interface LeaveRequestListProps {
  leaves: Leave[];
  employees: Array<{
    id: string;
    name: string;
    email: string;
    priority: number;
  }>;
  onLeaveStatusChange: (leaveId: number, newStatus: 'approved' | 'rejected') => void;
}

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({
  leaves,
  employees,
  onLeaveStatusChange,
}) => {
  const [processingLeaveId, setProcessingLeaveId] = useState<number | null>(null);

  const handleApprove = async (leaveId: number) => {
    setProcessingLeaveId(leaveId);
    try {
      await onLeaveStatusChange(leaveId, 'approved');
      toast.success('Leave request approved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve leave request');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const handleReject = async (leaveId: number) => {
    setProcessingLeaveId(leaveId);
    try {
      await onLeaveStatusChange(leaveId, 'rejected');
      toast.success('Leave request rejected');
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject leave request');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const getEmployeeName = (userId: number) => {
    const employee = employees.find(emp => emp.id === String(userId));
    return employee ? employee.name : 'Unknown Employee';
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const pendingLeaves = leaves
    .filter(leave => leave.status === 'Pending' && leave.leave_id !== undefined)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const recentLeaves = leaves
    .filter(leave => leave.status !== 'Pending' && leave.leave_id !== undefined)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Leave Requests</h3>
      
      {pendingLeaves.length === 0 ? (
        <div key="no-pending-leaves" className="text-center py-6 bg-muted/30 rounded-lg">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No pending leave requests</p>
        </div>
      ) : (
        <div key="pending-leaves-container" className="space-y-3">
          <p className="text-sm text-muted-foreground">{pendingLeaves.length} pending requests</p>
          
          {pendingLeaves.map(leave => (
            <div key={`leave-${leave.leave_id}`} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{getEmployeeName(leave.user_id)}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(leave.status)}
                  {leave.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(leave.leave_id)}
                        disabled={processingLeaveId === leave.leave_id}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(leave.leave_id)}
                        disabled={processingLeaveId === leave.leave_id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {recentLeaves.length > 0 && (
        <div key="recent-leaves-container">
          <Separator />
          <h4 className="font-medium text-sm">Recent Activity</h4>
          <div className="space-y-2">
            {recentLeaves.slice(0, 3).map(leave => {
              if (!leave.leave_id) return null;
              return (
                <div key={`recent-${leave.leave_id}`} className="border rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{getEmployeeName(leave.user_id)}</h5>
                      <div className="flex items-center mt-1">
                        <Badge 
                          key={`badge-${leave.leave_id}`}
                          className={
                            leave.status === 'Approved' 
                              ? 'bg-green-600' 
                              : 'bg-red-600'
                          }
                        >
                          {leave.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(leave.start_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestList;
