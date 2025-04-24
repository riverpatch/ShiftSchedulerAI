
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shift, User } from '@/utils/mockData';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import CustomButton from '@/components/ui/CustomButton';
import { Label } from '@/components/ui/label';

interface ShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  employees: User[];
  currentUserId: string;
  onSwapRequest: (shiftId: string, targetEmployeeId: string, reason: string) => void;
}

const ShiftSwapModal: React.FC<ShiftSwapModalProps> = ({ 
  isOpen, 
  onClose, 
  shift, 
  employees, 
  currentUserId,
  onSwapRequest 
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [swapReason, setSwapReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!shift) return null;

  // Get current user name
  const currentUser = employees.find(e => e.id === currentUserId);
  
  // Filter out employees that are already assigned to this shift and the current user
  const availableEmployees = employees.filter(
    e => !shift.employeeIds.includes(e.id) && e.id !== currentUserId
  );

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handleSubmit = () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee to swap with');
      return;
    }

    if (!swapReason.trim()) {
      toast.error('Please provide a reason for the swap request');
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSwapRequest(shift.id, selectedEmployeeId, swapReason);
      setSelectedEmployeeId("");
      setSwapReason("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Shift Swap</DialogTitle>
          <DialogDescription>
            Request to swap your shift with another employee
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/30 p-3 rounded-md space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatDate(shift.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
              <Badge className="ml-auto">{shift.position}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Currently assigned to: {currentUser?.name || 'You'}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employeeSelect">Swap with employee</Label>
            <Select 
              value={selectedEmployeeId} 
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger id="employeeSelect">
                <SelectValue placeholder="Select employee to swap with" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.length > 0 ? (
                  availableEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No available employees
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for swap request</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you need to swap this shift"
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <CustomButton
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Send Request
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftSwapModal;
