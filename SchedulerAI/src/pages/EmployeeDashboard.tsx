import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomCard from "@/components/ui/CustomCard";
import MyShifts from "../components/dashboard/MyShifts";
import LeaveRequestForm from "../components/dashboard/LeaveRequestForm";
import EmergencyLeave from "../components/dashboard/EmergencyLeave";
import ShiftCalendar from "@/components/dashboard/ShiftCalendar";
import ShiftSwapModal from "@/components/dashboard/ShiftSwapModal";
import CustomButton from "@/components/ui/CustomButton";
import Badge from "@/components/ui/badge";
import { PostgrestSingleResponse } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Shift = Tables['shift_schedule']['Row'];
type Leave = Tables['leave_requests']['Row'];
type ShiftSwapRequest = Tables['shift_swap_requests']['Row'];

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);

  // State for shift swap modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedShiftForSwap, setSelectedShiftForSwap] =
    useState<Shift | null>(null);

  const fetchEmployeeData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      type ShiftRow = Database['public']['Tables']['shift_schedule']['Row'];
      type LeaveRow = Database['public']['Tables']['leave_requests']['Row'];
      type UserRow = Database['public']['Tables']['users']['Row'];

      const [shiftsResult, leavesResult, employeesResult]: [
        PostgrestSingleResponse<ShiftRow[]>,
        PostgrestSingleResponse<LeaveRow[]>,
        PostgrestSingleResponse<UserRow[]>
      ] = await Promise.all([
        supabase
          .from('shift_schedule')
          .select('*')
          .returns<ShiftRow[]>(),
        supabase
          .from('leave_requests')
          .select('*')
          .returns<LeaveRow[]>(),
        supabase
          .from('users')
          .select('*')
          .returns<UserRow[]>()
      ]);

      // Handle any errors
      if (shiftsResult.error) throw shiftsResult.error;
      if (leavesResult.error) throw leavesResult.error;
      if (employeesResult.error) throw employeesResult.error;

      // Set the data with proper null checks
      const shifts = shiftsResult.data ?? [];
      const leaves = leavesResult.data ?? [];
      const employees = employeesResult.data ?? [];

      setAllShifts(shifts);
      setEmployees(employees);

      // Filter data for current user
      setMyShifts(shifts.filter(shift => shift.user_id === user.user_id));
      setMyLeaves(leaves.filter(leave => leave.user_id === user.user_id));
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
      toast.error("Failed to load your schedule data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyLeaveSubmit = () => {
    fetchEmployeeData();
    toast.success("Your shifts have been updated");
  };

  const handleRequestSwap = (shift: Shift) => {
    setSelectedShiftForSwap(shift);
    setIsSwapModalOpen(true);
  };

  const handleSwapRequestSubmit = async (
    shiftId: string,
    targetEmployeeId: string,
    reason: string
  ) => {
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .insert({
          shift_id: Number(shiftId),
          requester_user_id: user?.user_id,
          requested_user_id: Number(targetEmployeeId),
          swap_reason: reason,
          status: 'pending',
          ai_suggested: false
        });

      if (error) throw error;
      toast.success("Swap request sent successfully");
      fetchEmployeeData();
    } catch (error) {
      console.error('Failed to submit swap request:', error);
      toast.error("Failed to send swap request");
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#001140]">Employee Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-2 text-[#001140]">Welcome, {user?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomCard className="md:col-span-2">
          <Tabs defaultValue="my-schedule">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="my-schedule">My Schedule</TabsTrigger>
              <TabsTrigger value="swap-requests">Swap Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="my-schedule" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg text-[#001140]">Upcoming Shifts</h2>
                <div className="flex space-x-2">
                  <CustomButton
                    variant={viewMode === "list" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    List View
                  </CustomButton>
                  <CustomButton
                    variant={viewMode === "calendar" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                  >
                    Calendar View
                  </CustomButton>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-t-[#261e67] rounded-full animate-spin"></div>
                </div>
              ) : viewMode === "list" ? (
                <MyShifts
                  shifts={myShifts.filter(
                    (s) => new Date(s.date) >= new Date()
                  )}
                  onRequestSwap={handleRequestSwap}
                />
              ) : (
                <ShiftCalendar
                  shifts={myShifts.filter(
                    (s) => new Date(s.date) >= new Date()
                  )}
                  employees={employees}
                  onRequestSwap={handleRequestSwap}
                />
              )}
            </TabsContent>

            <TabsContent value="swap-requests" className="space-y-4">
              <h2 className="font-semibold text-lg text-[#001140]">Swap Requests</h2>

              {swapRequests.length > 0 ? (
                <div className="space-y-3">
                  {swapRequests.map((request) => (
                    <CustomCard key={request.swap_id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#001140]">Swap Request</p>
                          <p className="text-sm text-[#6f7d7f] mt-1">
                            {request.swap_reason}
                          </p>
                        </div>
                        <Badge className="bg-[#001140] text-[#f2fdff]">
                          {request.status}
                        </Badge>
                      </div>
                    </CustomCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#f2fdff] rounded-lg">
                  <p className="text-[#6f7d7f]">
                    You don't have any active swap requests
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CustomCard>

        <div className="space-y-4">
          <CustomCard>
            <h2 className="font-semibold text-lg text-[#001140] mb-4">Request Leave</h2>
            <LeaveRequestForm />
          </CustomCard>

          <CustomCard>
            <h2 className="font-semibold text-lg text-[#001140] mb-4">Emergency Options</h2>
            <EmergencyLeave
              employeeId={String(user?.user_id || 0)}
              shifts={allShifts}
              employees={employees}
              onEmergencyLeaveSubmit={handleEmergencyLeaveSubmit}
            />
          </CustomCard>
        </div>
      </div>

      {/* Shift Swap Modal */}
      <ShiftSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        shift={selectedShiftForSwap}
        employees={employees}
        currentUserId={String(user?.user_id || 0)}
        onSwapRequest={handleSwapRequestSubmit}
      />
    </div>
  );
};

export default EmployeeDashboard;
