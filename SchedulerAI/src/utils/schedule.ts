import { getShifts } from './supabaseApi';
import { User, Shift, Leave } from './mockData';

export const getScheduleStats = async (): Promise<{
  totalShifts: number;
  assignedShifts: number;
  unassignedShifts: number;
  completedShifts: number;
  upcomingShifts: number;
}> => {
  const shifts = await getShifts();
  const totalShifts = shifts.length;
  const assignedShifts = shifts.filter(s => !!s.id).length;
  const unassignedShifts = shifts.filter(s => !s.id).length;
  const completedShifts = shifts.filter(s => s.status === 'Completed').length;
  const upcomingShifts = shifts.filter(s => s.status === 'Scheduled').length;
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
      const employeeLeaves = new Map<string, string[]>();
      leaveRequests.forEach(leave => {
        if (leave.status === 'Approved') {
          const start = new Date(leave.start_date);
          const end = new Date(leave.end_date);
          const days: string[] = [];
          
          // Get all days between start and end
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(d.toISOString().split('T')[0]);
          }
          
          if (employeeLeaves.has(leave.employee_id)) {
            employeeLeaves.get(leave.employee_id)?.push(...days);
          } else {
            employeeLeaves.set(leave.employee_id, days);
          }
        }
      });
      
      // Generate shifts for each day
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Morning shift (8am - 4pm)
        const morningEmployees = assignEmployeesToShift(employees, employeeLeaves, dateStr, 2);
        newShifts.push({
          id: `shift-${dateStr}-morning`,
          date: dateStr,
          startTime: '08:00',
          endTime: '16:00',
          employeeIds: morningEmployees,
          position: 'Floor Staff',
          status: morningEmployees.length > 0 ? 'Scheduled' : 'Unassigned',
        });
        
        // Evening shift (4pm - 12am)
        const eveningEmployees = assignEmployeesToShift(
          employees.filter(e => !morningEmployees.includes(e.id)), 
          employeeLeaves, 
          dateStr,
          2
        );
        newShifts.push({
          id: `shift-${dateStr}-evening`,
          date: dateStr,
          startTime: '16:00',
          endTime: '00:00',
          employeeIds: eveningEmployees,
          position: 'Floor Staff',
          status: eveningEmployees.length > 0 ? 'Scheduled' : 'Unassigned',
        });
      }
      
      resolve(newShifts);
    }, 1500); // Simulate complex processing
  });
};

// Helper to assign employees to a shift
const assignEmployeesToShift = (
  availableEmployees: User[],
  employeeLeaves: Map<string, string[]>,
  date: string,
  count: number
): string[] => {
  // Filter out employees on leave for this date
  const employees = availableEmployees.filter(emp => {
    const leaveDays = employeeLeaves.get(emp.id) || [];
    return !leaveDays.includes(date);
  });
  
  // Sort by priority (highest first)
  employees.sort((a, b) => b.priority - a.priority);
  
  // Return the top 'count' employees, or all if fewer are available
  return employees.slice(0, count).map(e => e.id);
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
        shift => shift.date === date && shift.employeeIds.includes(employeeId)
      );
      
      let suggestedReplacement: User | null = null;
      const updatedShifts = [...shifts];
      
      // Handle each affected shift
      affectedShifts.forEach(shift => {
        const shiftIndex = updatedShifts.findIndex(s => s.id === shift.id);
        
        if (shiftIndex >= 0) {
          // Remove the employee from the shift
          const updatedEmployeeIds = shift.employeeIds.filter(id => id !== employeeId);
          
          // Find available replacement
          const availableEmployees = employees.filter(e => 
            e.id !== employeeId && !shift.employeeIds.includes(e.id)
          );
          
          // Sort by priority
          availableEmployees.sort((a, b) => b.priority - a.priority);
          
          if (availableEmployees.length > 0) {
            suggestedReplacement = availableEmployees[0];
            updatedEmployeeIds.push(suggestedReplacement.id);
          }
          
          // Update the shift
          updatedShifts[shiftIndex] = {
            ...shift,
            employeeIds: updatedEmployeeIds,
            status: updatedEmployeeIds.length > 0 ? 'Scheduled' : 'Unassigned'
          };
        }
      });
      
      resolve({ updatedShifts, suggestedReplacement });
    }, 1000);
  });
};
