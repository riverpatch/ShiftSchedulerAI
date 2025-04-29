import { fetchShifts } from './mockData';
import { User, Shift, Leave } from './mockData';

export const getScheduleStats = async (): Promise<{
  totalShifts: number;
  assignedShifts: number;
  unassignedShifts: number;
  completedShifts: number;
  upcomingShifts: number;
}> => {
  const shifts = await fetchShifts();
  const totalShifts = shifts.length;
  const assignedShifts = shifts.filter(s => !!s.shift_id).length;
  const unassignedShifts = shifts.filter(s => !s.shift_id).length;
  const completedShifts = shifts.filter(s => s.shift_status === 'assigned').length;
  const upcomingShifts = shifts.filter(s => s.shift_status === 'assigned').length;
  return {
    totalShifts,
    assignedShifts,
    unassignedShifts,
    completedShifts,
    upcomingShifts,
  };
};

// Mock AI scheduler
// Using imported types from mockData but creating our own data arrays for the functions
// This avoids the circular import issue

// Mock AI scheduler
export const generateSchedule = (
  employees: User[],
  existingShifts: Shift[],
  leaveRequests: Leave[],
  dateRange: { start: string; end: string }
): Promise<Shift[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is a simplified mock of what an AI scheduler might do
      // In a real implementation, this would be a much more complex algorithm

      const newShifts: Shift[] = [];
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      // Create a map of employees to their leave days
      const employeeLeaves = new Map<number, string[]>();
      leaveRequests.forEach(leave => {
        if (leave.status === 'approved') {
          const start = new Date(leave.start_datetime);
          const end = new Date(leave.end_datetime);
          const days: string[] = [];
          
          // Get all days between start and end
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(d.toISOString().split('T')[0]);
          }
          
          if (employeeLeaves.has(leave.user_id)) {
            employeeLeaves.get(leave.user_id)?.push(...days);
          } else {
            employeeLeaves.set(leave.user_id, days);
          }
        }
      });
      
      // Generate shifts for each day
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Morning shift (8am - 4pm)
        const morningEmployees = assignEmployeesToShift(employees, employeeLeaves, dateStr, 2);
        newShifts.push({
          shift_id: Number(`${dateStr.replace(/-/g, '')}1`),
          date: dateStr,
          shift_start_time: '08:00',
          shift_end_time: '16:00',
          user_id: 0,
          assignment_type: 'manual',
          shift_status: morningEmployees.length > 0 ? 'assigned' : 'emergency',
        });
        
        // Evening shift (4pm - 12am)
        const eveningEmployees = assignEmployeesToShift(
          employees.filter(e => !morningEmployees.includes(e.user_id)), 
          employeeLeaves, 
          dateStr,
          2
        );
        newShifts.push({
          shift_id: Number(`${dateStr.replace(/-/g, '')}2`),
          date: dateStr,
          shift_start_time: '16:00',
          shift_end_time: '00:00',
          user_id: 0,
          assignment_type: 'manual',
          shift_status: eveningEmployees.length > 0 ? 'assigned' : 'emergency',
        });
      }
      
      resolve(newShifts);
    }, 1500); // Simulate complex processing
  });
};

// Helper to assign employees to a shift
const assignEmployeesToShift = (
  availableEmployees: User[],
  employeeLeaves: Map<number, string[]>,
  date: string,
  count: number
): number[] => {
  // Filter out employees on leave for this date
  const employees = availableEmployees.filter(emp => {
    const leaveDays = employeeLeaves.get(emp.user_id) || [];
    return !leaveDays.includes(date);
  });
  
  // Sort by priority_level (highest first)
  employees.sort((a, b) => b.priority_level - a.priority_level);
  
  // Return the top 'count' employees, or all if fewer are available
  return employees.slice(0, count).map(e => e.user_id);
};

// Handle emergency leave and reschedule
export const handleEmergencyLeave = (
  employeeId: string,
  date: string,
  shifts: Shift[],
  employees: User[]
): Promise<{ updatedShifts: Shift[], suggestedReplacement: User | null }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find shifts affected by this emergency leave
      const affectedShifts = shifts.filter(
        shift => shift.date === date && shift.user_id === Number(employeeId)
      );
      
      let suggestedReplacement: User | null = null;
      const updatedShifts = [...shifts];
      
      // Handle each affected shift
      affectedShifts.forEach(shift => {
        const shiftIndex = updatedShifts.findIndex(s => s.shift_id === shift.shift_id);
        
        if (shiftIndex >= 0) {
          // Remove the employee from the shift
          const updatedEmployeeIds = shift.user_id !== Number(employeeId) ? [shift.user_id] : [];
          
          // Find available replacement
          const availableEmployees = employees.filter(e => 
            e.user_id !== Number(employeeId) && shift.user_id !== e.user_id
          );
          
          // Sort by priority_level
          availableEmployees.sort((a, b) => b.priority_level - a.priority_level);
          
          if (availableEmployees.length > 0) {
            suggestedReplacement = availableEmployees[0];
            updatedEmployeeIds.push(suggestedReplacement.user_id);
          }
          
          // Update the shift
          updatedShifts[shiftIndex] = {
            ...shift,
            user_id: updatedEmployeeIds.length > 0 ? suggestedReplacement.user_id : 0,
            shift_status: updatedEmployeeIds.length > 0 ? 'assigned' : 'emergency',
          };
        }
      });
      
      resolve({ updatedShifts, suggestedReplacement });
    }, 1000);
  });
};
