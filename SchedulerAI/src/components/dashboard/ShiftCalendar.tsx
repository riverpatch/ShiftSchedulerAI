
import React, { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Shift, User } from '@/utils/mockData';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomCard from '@/components/ui/CustomCard';

interface ShiftCalendarProps {
  shifts: Shift[];
  employees: User[];
  onRequestSwap?: (shift: Shift) => void;
}

const ShiftCalendar: React.FC<ShiftCalendarProps> = ({ shifts, employees, onRequestSwap }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([]);

  // Function to handle day selection
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const shiftsOnDate = shifts.filter(shift => 
        isSameDay(parseISO(shift.date), date)
      );
      setSelectedShifts(shiftsOnDate);
      setIsDialogOpen(shiftsOnDate.length > 0);
    }
  };

  // Function to get employee names by IDs
  const getEmployeeNames = (employeeIds: string[]): string => {
    if (employeeIds.length === 0) return 'Unassigned';
    return employeeIds
      .map(id => {
        const employee = employees.find(e => e.id === id);
        return employee ? employee.name : 'Unknown';
      })
      .join(', ');
  };

  // Modify the calendar day render to highlight days with shifts
  const modifiers = {
    hasShifts: shifts.map(shift => parseISO(shift.date)),
  };

  const modifiersClassNames = {
    hasShifts: "border-2 border-scheduler-primary",
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-600">In Progress</Badge>;
      case 'Scheduled':
        return <Badge className="bg-scheduler-primary">Scheduled</Badge>;
      case 'Unassigned':
        return <Badge variant="destructive">Unassigned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className="border rounded-md"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedShifts.length} shifts scheduled for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {selectedShifts.map(shift => (
              <CustomCard 
                key={shift.id}
                className={`${shift.status === 'Unassigned' ? 'border-red-300' : ''}`}
                isHoverable={!!onRequestSwap}
                onClick={() => onRequestSwap && onRequestSwap(shift)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium">
                      {shift.startTime} - {shift.endTime}
                    </span>
                    <p className="text-sm mt-1">{getEmployeeNames(shift.employeeIds)}</p>
                  </div>
                  <div>
                    {getStatusBadge(shift.status)}
                  </div>
                </div>
              </CustomCard>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftCalendar;
