import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fetchEmployees, fetchLeaves, fetchShifts, getPendingLeaves, getUnassignedShifts, Leave } from '../utils/mockData';
import { generateSchedule, getScheduleStats } from '../utils/schedule';
import OwnerMetricsCards from '../components/dashboard/OwnerMetricsCards';
import LeaveRequestList from '../components/dashboard/LeaveRequestList';
import ScheduleOverview from '../components/dashboard/ScheduleOverview';
import { User, Shift } from '../utils/mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomButton from '@/components/ui/CustomButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [unassignedShiftCount, setUnassignedShiftCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [lastScheduleRun, setLastScheduleRun] = useState('Never');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [fetchedEmployees, fetchedLeaves, fetchedShifts] = await Promise.all([
        fetchEmployees(),
        fetchLeaves(),
        fetchShifts()
      ]);
      
      setEmployees(fetchedEmployees);
      setLeaves(fetchedLeaves);
      setShifts(fetchedShifts);
      
      setPendingLeaveCount(fetchedLeaves.filter(leave => leave.status === 'Pending').length);
      setUnassignedShiftCount(fetchedShifts.filter(shift => shift.status === 'Unassigned' || shift.employeeIds.length === 0).length);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const runAiScheduler = async () => {
    setIsGeneratingSchedule(true);
    setIsScheduleDialogOpen(true);
    
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 14);
      
      const dateRange = {
        start: today.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      };
      
      const newShifts = await generateSchedule(employees, shifts, leaves, dateRange);
      
      setShifts(prevShifts => {
        const oldShifts = prevShifts.filter(shift => {
          const shiftDate = new Date(shift.date);
          return shiftDate < today || shiftDate > endDate;
        });
        return [...oldShifts, ...newShifts];
      });
      
      const runTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastScheduleRun(`Today at ${runTime}`);
      
      toast.success('Schedule generated successfully');
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      toast.error('Failed to generate schedule');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };
  
  const handleLeaveStatusChange = () => {
    fetchDashboardData();
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-2">Welcome, {user?.name}</span>
        </div>
      </div>
      
      <OwnerMetricsCards
        employeeCount={employees.length}
        pendingLeaveCount={pendingLeaveCount}
        unassignedShiftCount={unassignedShiftCount}
        lastAiSchedule={lastScheduleRun}
        onRunAiScheduler={runAiScheduler}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg bg-white p-4 shadow-sm">
          <Tabs defaultValue="leave-requests">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
            </TabsList>
            
            <TabsContent value="leave-requests" className="space-y-4">
              <LeaveRequestList
                leaves={leaves}
                employees={employees}
                onLeaveStatusChange={handleLeaveStatusChange}
              />
            </TabsContent>
            
            <TabsContent value="employees" className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Employee Management</h3>
                <CustomButton variant="secondary" size="sm">Add Employee</CustomButton>
              </div>
              
              <div className="border rounded-lg divide-y">
                {employees.map(employee => (
                  <div key={employee.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">Priority: {employee.priority}</span>
                      <CustomButton variant="outline" size="sm">Edit</CustomButton>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="border rounded-lg bg-white p-4 shadow-sm">
          <ScheduleOverview
            shifts={shifts.filter(s => new Date(s.date) >= new Date())}
            employees={employees}
          />
        </div>
      </div>
      
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-scheduler-primary" />
              AI Schedule Generator
            </DialogTitle>
            <DialogDescription>
              {isGeneratingSchedule
                ? 'Generating optimal schedule based on employee availability and priorities...'
                : 'Schedule generation complete!'}
            </DialogDescription>
          </DialogHeader>
          
          {isGeneratingSchedule ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-4 border-t-scheduler-primary rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-center text-muted-foreground">
                This may take a few moments. The AI is analyzing leave requests,
                employee priorities, and shift requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Shifts:</span>
                  <span className="text-sm font-medium">14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Assigned Shifts:</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Unassigned Shifts:</span>
                  <span className="text-sm font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Leave Conflicts Resolved:</span>
                  <span className="text-sm font-medium">3</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <CustomButton
                  onClick={() => setIsScheduleDialogOpen(false)}
                  variant="primary"
                >
                  View Schedule
                </CustomButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerDashboard;
