import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import CustomButton from '@/components/ui/CustomButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/client';

type Shift = Database['public']['Tables']['shift_schedule']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface EmergencyLeaveProps {
  employeeId: string;
  shifts: Shift[];
  employees: User[];
  onEmergencyLeaveSubmit: () => void;
}

const EmergencyLeave: React.FC<EmergencyLeaveProps> = ({ 
  employeeId, 
  shifts, 
  employees,
  onEmergencyLeaveSubmit
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const submitEmergencyLeave = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for your emergency leave');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Check if employee has shifts today
      const todayShifts = shifts.filter(
        shift => shift.date === today && shift.user_id === Number(employeeId)
      );
      
      if (todayShifts.length === 0) {
        toast.error('You don\'t have any shifts today that require emergency leave');
        setIsDialogOpen(false);
        return;
      }

      // Create emergency leave request
      const { error: leaveError } = await supabase
        .from('leave_requests')
        .insert({
          user_id: Number(employeeId),
          leave_type: 'emergency',
          start_datetime: `${today}T00:00:00`,
          end_datetime: `${today}T23:59:59`,
          reason: reason,
          status: 'pending'
        });

      if (leaveError) {
        throw leaveError;
      }

      // Update shift status to unassigned
      const { error: shiftError } = await supabase
        .from('shift_schedule')
        .update({ shift_status: 'unassigned' })
        .in('shift_id', todayShifts.map(shift => shift.shift_id));

      if (shiftError) {
        throw shiftError;
      }
      
      toast.success('Emergency leave request submitted successfully');
      
      // Close dialog and trigger refresh
      setIsDialogOpen(false);
      onEmergencyLeaveSubmit();
      
      // Reset form
      setReason('');
    } catch (error) {
      console.error('Failed to process emergency leave:', error);
      toast.error('Failed to process emergency leave request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <CustomButton 
          className={`w-full bg-[#ef4444] text-[#fff] border-none hover:bg-[#ef4444]${isSubmitting ? ' pointer-events-none' : ''}`}
          icon={<AlertTriangle className="h-4 w-4 text-[#fff]" />}
        >
          Emergency Leave Request
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#001140]">Emergency Leave Request</DialogTitle>
          <DialogDescription className="text-[#6f7d7f]">
            Please provide details about your emergency leave request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 p-3 rounded-md space-y-2 border border-destructive">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Emergency Leave</span>
            </div>
            <p className="text-sm text-destructive">
              This will automatically notify your manager and attempt to find a replacement for your shifts.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium text-[#001140]">
              Reason for Emergency Leave
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain the nature of your emergency..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <CustomButton
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="destructive"
            onClick={submitEmergencyLeave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Emergency Leave'}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyLeave;
