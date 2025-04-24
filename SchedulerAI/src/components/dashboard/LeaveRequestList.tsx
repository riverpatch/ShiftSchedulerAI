import React, { useState } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { approveLeave, rejectLeave } from '@/utils/supabaseApi';
import { toast } from 'react-hot-toast';

interface Leave {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  reason: string;
  submitted_at: string;
}
interface User {
  id: string;
  name: string;
}
interface LeaveRequestListProps {
  leaves: Leave[];
  employees: User[];
  onLeaveStatusChange: () => void;
}

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({ leaves, employees, onLeaveStatusChange }) => {
  const [processingLeaveId, setProcessingLeaveId] = useState<string | null>(null);
  
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };
  
  const handleApproveLeave = async (leaveId: string) => {
    setProcessingLeaveId(leaveId);
    try {
      await approveLeave(leaveId);
      toast.success('Leave request approved');
      onLeaveStatusChange();
    } catch (error) {
      toast.error('Failed to approve leave');
      console.error(error);
    } finally {
      setProcessingLeaveId(null);
    }
  };
  
  const handleRejectLeave = async (leaveId: string) => {
    setProcessingLeaveId(leaveId);
    try {
      await rejectLeave(leaveId);
      toast.success('Leave request rejected');
      onLeaveStatusChange();
    } catch (error) {
      toast.error('Failed to reject leave');
      console.error(error);
    } finally {
      setProcessingLeaveId(null);
    }
  };
  
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const pendingLeaves = leaves.filter(leave => leave.status === 'Pending');
  const recentLeaves = leaves.filter(leave => leave.status !== 'Pending');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Leave Requests</h3>
      
      {pendingLeaves.length === 0 ? (
        <div className="text-center py-6 bg-muted/30 rounded-lg">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No pending leave requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{pendingLeaves.length} pending requests</p>
          
          {pendingLeaves.map(leave => (
            <div key={leave.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{getEmployeeName(leave.employee_id)}</h4>
                  <div className="flex items-center mt-1">
                    <Badge className="bg-scheduler-primary">{leave.type}</Badge>
                    <span className="text-sm text-muted-foreground ml-2">
                      {leave.start_date === leave.end_date 
                        ? formatDate(leave.start_date)
                        : `${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}`
                      }
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{leave.reason}</p>
                </div>
                
                <div className="flex space-x-2">
                  <CustomButton
                    size="sm"
                    variant="success"
                    onClick={() => handleApproveLeave(leave.id)}
                    isLoading={processingLeaveId === leave.id}
                    disabled={processingLeaveId !== null}
                    icon={<Check className="h-4 w-4" />}
                  >
                    Approve
                  </CustomButton>
                  <CustomButton
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRejectLeave(leave.id)}
                    isLoading={processingLeaveId === leave.id}
                    disabled={processingLeaveId !== null}
                    icon={<X className="h-4 w-4" />}
                  >
                    Reject
                  </CustomButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {recentLeaves.length > 0 && (
        <>
          <Separator />
          <h4 className="font-medium text-sm">Recent Activity</h4>
          <div className="space-y-2">
            {recentLeaves.slice(0, 3).map(leave => (
              <div key={leave.id} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">{getEmployeeName(leave.employee_id)}</h5>
                    <div className="flex items-center mt-1">
                      <Badge className={
                        leave.status === 'Approved' 
                          ? 'bg-green-600' 
                          : 'bg-red-600'
                      }>
                        {leave.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(leave.start_date)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {leave.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveRequestList;
