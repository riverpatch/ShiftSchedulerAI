import React from "react";
import CustomCard from "@/components/ui/CustomCard";
import { Badge } from "@/components/ui/badge";

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  employee_id: string | null;
  status: "Assigned" | "Unassigned";
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  priority: number;
}

interface ScheduleOverviewProps {
  shifts: Shift[];
  employees: Employee[];
  onSelectShift?: (shift: Shift) => void;
}

const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({
  shifts,
  employees,
  onSelectShift,
}) => {
  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  // Get employee name by ID
  const getEmployeeName = (
    employeeId: string | null
  ): string => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find(
      (e) => e.id === employeeId
    );
    return employee ? employee.name : "Unknown";
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Assigned":
        return (
          <Badge className="bg-[#001140] text-[#f2fdff]">
            Assigned
          </Badge>
        );
      case "Unassigned":
        return (
          <Badge className="bg-[#ef4444] text-[#f2fdff]">
            Unassigned
          </Badge>
        );
      default:
        return (
          <Badge className="border-primary text-[#001140]">
            {status}
          </Badge>
        );
    }
  };

  // Sort dates
  const sortedDates = Object.keys(shiftsByDate).sort(
    (a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    }
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#001140]">
        Schedule Overview
      </h3>

      <div className="space-y-4">
        {sortedDates.slice(0, 5).map((date) => (
          <div
            key={date}
            className="space-y-2"
          >
            <h4 className="font-medium text-sm text-[#6f7d7f]">
              {formatDate(date)}
            </h4>

            <div className="grid grid-cols-1 gap-2">
              {shiftsByDate[date].map((shift) => (
                <CustomCard
                  key={shift.id}
                  className={`${
                    shift.status === "Unassigned"
                      ? "border-[#ef4444]"
                      : "border-primary"
                  }`}
                  isHoverable={!!onSelectShift}
                  onClick={() =>
                    onSelectShift && onSelectShift(shift)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium text-[#001140]">
                        {shift.start_time} -{" "}
                        {shift.end_time}
                      </span>
                      <p className="text-sm mt-1 text-[#6f7d7f]">
                        {getEmployeeName(shift.employee_id)}
                      </p>
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
