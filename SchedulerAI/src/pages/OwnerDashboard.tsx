import React, { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  supabase,
  SupabaseError,
} from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/client";
import OwnerMetricsCards from "../components/dashboard/OwnerMetricsCards";
import LeaveRequestList from "../components/dashboard/LeaveRequestList";
import ScheduleOverview from "../components/dashboard/ScheduleOverview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "@/components/ui/CustomButton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SupabaseTest } from "../components/test/SupabaseTest";
import { Leave } from "@/types/leave";

interface CustomError {
  message: string;
  code?: string;
  details?: any;
}

interface UserEmployee {
  user_id: number;
  name: string;
  email: string;
  priority_level: number;
  role: string;
  status?: string;
}

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  employee_id: string | null;
  status: "Assigned" | "Unassigned";
  created_at: string;
}

// Conversion helpers
const convertEmployee = (user: any): UserEmployee => ({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
  priority_level: user.priority_level || 1,
  role: user.role || "Employee",
  status: user.status,
});

const convertLeave = (leave: any): Leave => ({
  leave_id: Number(leave.leave_id ?? leave.id),
  user_id: Number(leave.user_id ?? leave.employee_id),
  leave_type: leave.leave_type ?? leave.type,
  start_datetime: leave.start_datetime ?? leave.start_date,
  end_datetime: leave.end_datetime ?? leave.end_date,
  reason: leave.reason,
  status: (leave.status || "").toLowerCase() as
    | "pending"
    | "approved"
    | "rejected",
  approver_id: leave.approver_id
    ? Number(leave.approver_id)
    : null,
  request_timestamp:
    leave.request_timestamp ??
    leave.submitted_at ??
    new Date().toISOString(),
});

const convertShift = (shift: any): Shift => ({
  id: shift.id,
  date: shift.date,
  start_time: shift.shift_start_time,
  end_time: shift.shift_end_time,
  employee_id: shift.user_id || null,
  status:
    shift.shift_status === "unassigned"
      ? "Unassigned"
      : "Assigned",
  created_at: shift.created_at || new Date().toISOString(),
});

// Helper to map UserEmployee to Employee shape for components
const toComponentEmployee = (user: UserEmployee) => ({
  id: String(user.user_id),
  name: user.name,
  email: user.email,
  priority: user.priority_level,
});

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<
    UserEmployee[]
  >([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pendingLeaveCount, setPendingLeaveCount] =
    useState(0);
  const [unassignedShiftCount, setUnassignedShiftCount] =
    useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSchedule, setIsGeneratingSchedule] =
    useState(false);
  const [lastScheduleRun, setLastScheduleRun] =
    useState("Never");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] =
    useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch employees (users with role 'Employee')
      const employeesQuery = (supabase as any)
        .from("users")
        .select("*")
        .eq("role", "Employee");
      const employeesResult = await employeesQuery;
      const { data: employeesData, error: employeesError } =
        employeesResult;
      if (employeesError) {
        console.error(
          "Error fetching employees:",
          employeesError
        );
        throw new SupabaseError(
          "Failed to fetch employees",
          "QUERY_ERROR",
          employeesError
        );
      }
      setEmployees(
        (employeesData || []).map(convertEmployee)
      );

      // Fetch leaves
      const { data: leavesData, error: leavesError } =
        await supabase.from("leave_requests").select("*");
      if (leavesError) {
        console.error(
          "Error fetching leaves:",
          leavesError
        );
        throw new SupabaseError(
          "Failed to fetch leave requests",
          "QUERY_ERROR",
          leavesError
        );
      }
      setLeaves(
        Array.isArray(leavesData)
          ? leavesData.map(convertLeave)
          : []
      );
      setPendingLeaveCount(
        Array.isArray(leavesData)
          ? leavesData.reduce(
              (count, leave) =>
                (leave as any) !== null &&
                typeof leave === "object" &&
                "status" in (leave as any) &&
                (leave as any).status === "pending"
                  ? count + 1
                  : count,
              0
            )
          : 0
      );

      // Fetch shifts
      const { data: shiftsData, error: shiftsError } =
        await supabase.from("shift_schedule").select("*");
      if (shiftsError) {
        console.error(
          "Error fetching shifts:",
          shiftsError
        );
        throw new SupabaseError(
          "Failed to fetch shifts",
          "QUERY_ERROR",
          shiftsError
        );
      }
      setShifts(
        Array.isArray(shiftsData)
          ? shiftsData.map(convertShift)
          : []
      );
      setUnassignedShiftCount(
        Array.isArray(shiftsData)
          ? shiftsData.reduce(
              (count, shift) =>
                shift !== null &&
                (shift as any) !== null &&
                typeof shift === "object" &&
                "shift_status" in (shift as any) &&
                (shift as any).shift_status === "unassigned"
                  ? count + 1
                  : count,
              0
            )
          : 0
      );
    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error
      );
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveStatusChange = async (
    leaveId: number,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      const { error } = (await supabase
        .from("leave_requests")
        .update({ status: newStatus })
        .eq("leave_id", leaveId)) as { error: any };

      if (error) {
        console.error(
          "Error updating leave status:",
          error
        );
        throw new SupabaseError(
          "Failed to update leave status",
          "UPDATE_ERROR",
          error
        );
      }

      toast.success(`Leave request ${newStatus}`);
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast.error("Failed to update leave status");
    }
  };

  const runAiScheduler = async () => {
    setIsGeneratingSchedule(true);
    setIsScheduleDialogOpen(true);

    try {
      // Here you would implement the AI scheduling logic
      // For now, we'll just simulate the process
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      setLastScheduleRun(new Date().toLocaleString());
      toast.success("Schedule generated successfully");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("Failed to generate schedule");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto p-4 bg-dark-background space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark-foreground">
          Owner Dashboard
        </h1>
        <div className="flex items-center">
          <span className="mr-2 text-dark-foreground">
            Welcome, {user?.name}
          </span>
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
        <div className="border border-primary rounded-lg bg-dark-foreground p-4 shadow-sm">
          <Tabs defaultValue="leave-requests">
            <TabsList className="grid w-full bg-dark-foreground grid-cols-2 mb-4">
              <TabsTrigger value="leave-requests">
                Leave Requests
              </TabsTrigger>
              <TabsTrigger value="employees">
                Employees
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="leave-requests"
              className="space-y-4 "
            >
              <LeaveRequestList
                leaves={leaves}
                employees={employees.map(
                  toComponentEmployee
                )}
                onLeaveStatusChange={
                  handleLeaveStatusChange
                }
              />
            </TabsContent>

            <TabsContent
              value="employees"
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
                <h3 className="font-semibold text-[#001140]">
                  Employee Management
                </h3>
                <CustomButton
                  variant="secondary"
                  size="sm"
                >
                  Add Employee
                </CustomButton>
              </div>

              <div className="border border-primary rounded-lg divide-y divide-[#261e67]">
                {employees.map((employee) => (
                  <div
                    key={employee.user_id}
                    className="p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:bg-[#e6f2f9]"
                  >
                    <div>
                      <p className="font-medium text-[#001140]">
                        {employee.name}
                      </p>
                      <p className="text-sm text-[#6f7d7f]">
                        {employee.email}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-2 text-[#001140]">
                        Priority: {employee.priority_level}
                      </span>
                      <CustomButton
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </CustomButton>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border border-primary rounded-lg bg-[#f2fdff] p-4 shadow-sm">
          <ScheduleOverview
            shifts={shifts.filter(
              (s) => new Date(s.date) >= new Date()
            )}
            employees={employees.map(toComponentEmployee)}
          />
        </div>
      </div>

      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-scheduler-primary" />
              AI Schedule Generator
            </DialogTitle>
            <DialogDescription>
              {isGeneratingSchedule
                ? "Generating optimal schedule based on employee availability and priorities..."
                : "Schedule generation complete!"}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingSchedule ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-4 border-t-scheduler-primary rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-center text-muted-foreground">
                This may take a few moments. The AI is
                analyzing leave requests, employee
                priorities, and shift requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="bg-card p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">
                    Total Shifts:
                  </span>
                  <span className="text-sm font-medium">
                    14
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    Assigned Shifts:
                  </span>
                  <span className="text-sm font-medium">
                    12
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    Unassigned Shifts:
                  </span>
                  <span className="text-sm font-medium">
                    2
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    Leave Conflicts Resolved:
                  </span>
                  <span className="text-sm font-medium">
                    3
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <CustomButton
                  onClick={() =>
                    setIsScheduleDialogOpen(false)
                  }
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
