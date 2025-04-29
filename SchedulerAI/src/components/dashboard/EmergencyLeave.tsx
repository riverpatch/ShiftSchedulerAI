import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import CustomButton from '@/components/ui/CustomButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { handleEmergencyLeave } from '@/utils/schedule';
import { User, Shift } from '@/utils/mockData';

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
      // Assuming today's date for emergency leave
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
      
      // Process emergency leave
      const result = await handleEmergencyLeave(employeeId, today, shifts, employees);
      
      // Show success with replacement info if available
      if (result.suggestedReplacement) {
        toast.success(`Emergency leave processed. ${result.suggestedReplacement.name} has been suggested as replacement.`);
      } else {
        toast.success('Emergency leave processed. No replacement found.');
      }
      
      // Close dialog and trigger refresh
      setIsDialogOpen(false);
      onEmergencyLeaveSubmit();
      
      // Reset form
      setReason('');
    } catch (error) {
      toast.error('Failed to process emergency leave');
      console.error(error);
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
            <label className="text-sm font-medium text-[#001140]">Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain your emergency situation"
              className="border border-[#261e67] bg-[#f2fdff] text-[#001140]"
            />
          </div>
        </div>

        <DialogFooter>
          <CustomButton
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="border border-[#261e67] text-[#001140] hover:bg-[#e6f2f9]"
            disabled={isSubmitting}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={submitEmergencyLeave}
            className="bg-[#001140] text-[#f2fdff] hover:bg-[#261e67]"
            isLoading={isSubmitting}
          >
            Submit Request
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyLeave;
