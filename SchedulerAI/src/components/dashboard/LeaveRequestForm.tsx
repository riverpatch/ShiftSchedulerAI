
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from 'react-hot-toast';

const LeaveRequestForm: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [leaveType, setLeaveType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    
    if (!leaveType) {
      toast.error('Please select a leave type');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for your leave request');
      return;
    }
    
    // Mock form submission
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Leave request submitted successfully');
      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setLeaveType('');
      setReason('');
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => date < (startDate || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Leave Type</label>
        <Select value={leaveType} onValueChange={setLeaveType}>
          <SelectTrigger>
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Vacation">Vacation</SelectItem>
            <SelectItem value="Sick">Sick Leave</SelectItem>
            <SelectItem value="Personal">Personal Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Reason</label>
        <Textarea
          placeholder="Provide details about your leave request"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end">
        <CustomButton
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          Submit Request
        </CustomButton>
      </div>
    </form>
  );
};

export default LeaveRequestForm;
