import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

export interface LeaveRequestDialogProps {
  onRequestSubmitted: () => void;
}

export const LeaveRequestDialog: React.FC<LeaveRequestDialogProps> = ({
  onRequestSubmitted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!startDate || !endDate || !user) {
      toast({
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('leave_requests').insert({
        user_id: user.id,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        status: 'pending',
        leave_type: 'Full Day',
        approver_id: '',
        reason: ''
      });

      if (error) throw error;

      toast({
        description: "Leave request submitted successfully",
      });
      
      setIsOpen(false);
      onRequestSubmitted();
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Request Leave</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>
            Select the start and end dates for your leave request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>Start Date</label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="rounded-md border"
            />
          </div>
          <div className="grid gap-2">
            <label>End Date</label>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              className="rounded-md border"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 