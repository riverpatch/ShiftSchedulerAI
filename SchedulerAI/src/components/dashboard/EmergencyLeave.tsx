
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
        shift => shift.date === today && shift.employeeIds.includes(employeeId)
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
          variant="destructive"
          className="w-full"
          icon={<AlertTriangle className="h-4 w-4" />}
        >
          Emergency Leave Request
        </CustomButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Emergency Leave
          </DialogTitle>
          <DialogDescription>
            Submit an emergency leave request for today's shift.
            This will immediately notify management and trigger the AI scheduler
            to find a replacement.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Reason</label>
            <Textarea
              placeholder="Explain your emergency situation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
            <strong>Important:</strong> Emergency leave should only be used for genuine emergencies.
            Misuse may affect your priority status for future scheduling.
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
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
            isLoading={isSubmitting}
          >
            Submit Emergency Leave
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyLeave;
