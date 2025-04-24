
import React from 'react';
import { Shift, User } from '@/utils/mockData';
import CustomCard from '@/components/ui/CustomCard';
import { Badge } from '@/components/ui/badge';

interface ScheduleOverviewProps {
  shifts: Shift[];
  employees: User[];
  onSelectShift?: (shift: Shift) => void;
}

const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({ shifts, employees, onSelectShift }) => {
  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);
  
  // Get employee names by IDs
  const getEmployeeNames = (employeeIds: string[]): string => {
    if (employeeIds.length === 0) return 'Unassigned';
    return employeeIds
      .map(id => {
        const employee = employees.find(e => e.id === id);
        return employee ? employee.name : 'Unknown';
      })
      .join(', ');
  };
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

  // Sort dates
  const sortedDates = Object.keys(shiftsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Schedule Overview</h3>
      
      <div className="space-y-4">
        {sortedDates.slice(0, 5).map(date => (
          <div key={date} className="space-y-2">
            <h4 className="font-medium text-sm">{formatDate(date)}</h4>
            
            <div className="grid grid-cols-1 gap-2">
              {shiftsByDate[date].map(shift => (
                <CustomCard 
                  key={shift.id}
                  className={`${shift.status === 'Unassigned' ? 'border-red-300' : ''}`}
                  isHoverable={!!onSelectShift}
                  onClick={() => onSelectShift && onSelectShift(shift)}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleOverview;
