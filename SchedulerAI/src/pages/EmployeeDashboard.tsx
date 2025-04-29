import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  fetchShifts,
  fetchLeaves,
  fetchUsers,
  getShiftsByUserId,
  getLeavesByUserId,
} from "../utils/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomCard from "@/components/ui/CustomCard";
import MyShifts from "../components/dashboard/MyShifts";
import LeaveRequestForm from "../components/dashboard/LeaveRequestForm";
import EmergencyLeave from "../components/dashboard/EmergencyLeave";
import { User, Shift, Leave } from "@/utils/mockData";
import ShiftCalendar from "@/components/dashboard/ShiftCalendar";
import ShiftSwapModal from "@/components/dashboard/ShiftSwapModal";
import CustomButton from "@/components/ui/CustomButton";
import Badge from "@/components/ui/badge";
const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [swapRequests, setSwapRequests] = useState<any[]>([]);

  // State for shift swap modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedShiftForSwap, setSelectedShiftForSwap] =
    useState<Shift | null>(null);

  const fetchEmployeeData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [fetchedShifts, fetchedLeaves, fetchedEmployees] =
        await Promise.all([fetchShifts(), fetchLeaves(), fetchUsers()]);

      setAllShifts(fetchedShifts);
      setEmployees(fetchedEmployees);

      setMyShifts(getShiftsByUserId(Number(user.id)));
      setMyLeaves(getLeavesByUserId(Number(user.id)));
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

  const handleSwapRequestSubmit = (
    shiftId: string,
    targetEmployeeId: string,
    reason: string
  ) => {
    // Create a new swap request
    const newSwapRequest = {
      id: `swap-${Date.now()}`,
      shiftId,
      requestorId: user?.id,
      targetEmployeeId,
      reason,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    // Add to swap requests
    setSwapRequests((prev) => [...prev, newSwapRequest]);

    toast.success("Swap request sent successfully");
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
                    <CustomCard key={request.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#001140]">Swap Request</p>
                          <p className="text-sm text-[#6f7d7f] mt-1">
                            {request.reason}
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
              employeeId={user?.id || ""}
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
        currentUserId={user?.id || ""}
        onSwapRequest={handleSwapRequestSubmit}
      />
    </div>
  );
};

export default EmployeeDashboard;
