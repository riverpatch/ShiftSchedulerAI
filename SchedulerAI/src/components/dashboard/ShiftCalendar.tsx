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
    hasShifts: "border-2 border-[#261e67]",
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-[#001140] text-[#f2fdff]">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-[#261e67] text-[#f2fdff]">In Progress</Badge>;
      case 'Scheduled':
        return <Badge className="bg-[#001140] text-[#f2fdff]">Scheduled</Badge>;
      case 'Unassigned':
        return <Badge className="bg-[#ef4444] text-[#f2fdff]">Unassigned</Badge>;
      default:
        return <Badge className="border-[#261e67] text-[#001140]">{status}</Badge>;
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
        className="border border-[#261e67] rounded-md"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#001140]">
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription className="text-[#6f7d7f]">
              {selectedShifts.length} shifts scheduled for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {selectedShifts.map(shift => (
              <CustomCard 
                key={shift.id}
                className={`${shift.status === 'Unassigned' ? 'border-[#ef4444]' : 'border-[#261e67]'} hover:bg-[#e6f2f9]`}
                isHoverable={!!onRequestSwap}
                onClick={() => onRequestSwap && onRequestSwap(shift)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium text-[#001140]">
                      {shift.startTime} - {shift.endTime}
                    </span>
                    <p className="text-sm mt-1 text-[#6f7d7f]">{getEmployeeNames(shift.employeeIds)}</p>
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
