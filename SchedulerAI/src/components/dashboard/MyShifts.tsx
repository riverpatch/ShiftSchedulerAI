
import React from 'react';
import { Shift } from '@/utils/mockData';
import { Badge } from '@/components/ui/badge';
import CustomCard from '@/components/ui/CustomCard';

interface MyShiftsProps {
  shifts: Shift[];
  onRequestSwap?: (shift: Shift) => void;
}

const MyShifts: React.FC<MyShiftsProps> = ({ shifts, onRequestSwap }) => {
  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Sort dates
  const sortedDates = Object.keys(shiftsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  if (shifts.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No shifts scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.map(date => (
        <div key={date} className="space-y-2">
          <h4 className="font-medium">{formatDate(date)}</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {shiftsByDate[date].map(shift => (
              <CustomCard 
                key={shift.id} 
                isHoverable={!!onRequestSwap}
                onClick={() => onRequestSwap && onRequestSwap(shift)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{shift.startTime} - {shift.endTime}</span>
                      <Badge className="ml-2 bg-gray-200 text-gray-800">{shift.position}</Badge>
                    </div>
                  </div>
                  <div>{getStatusBadge(shift.status)}</div>
                </div>
              </CustomCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyShifts;
