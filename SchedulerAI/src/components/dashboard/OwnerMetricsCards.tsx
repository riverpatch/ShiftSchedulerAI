
import React from 'react';
import { Users, Calendar, AlertTriangle, Brain } from 'lucide-react';
import CustomCard from '@/components/ui/CustomCard';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon, description, className }) => {
  return (
    <CustomCard className={className} isHoverable>
      <div className="flex items-center">
        <div className="p-2 mr-4 rounded-full bg-scheduler-primary/20">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-xs mt-1 text-muted-foreground">{description}</p>
        </div>
      </div>
    </CustomCard>
  );
};

interface OwnerMetricsCardsProps {
  employeeCount: number;
  pendingLeaveCount: number;
  unassignedShiftCount: number;
  lastAiSchedule: string;
  onRunAiScheduler: () => void;
}

const OwnerMetricsCards: React.FC<OwnerMetricsCardsProps> = ({
  employeeCount,
  pendingLeaveCount,
  unassignedShiftCount,
  lastAiSchedule,
  onRunAiScheduler
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Employees"
        value={employeeCount}
        icon={<Users className="h-5 w-5 text-scheduler-primary" />}
        description="Total active employees"
      />
      <MetricsCard
        title="Leave Requests"
        value={pendingLeaveCount}
        icon={<Calendar className="h-5 w-5 text-scheduler-primary" />}
        description="Pending approval"
      />
      <MetricsCard
        title="Unassigned Shifts"
        value={unassignedShiftCount}
        icon={<AlertTriangle className="h-5 w-5 text-scheduler-primary" />}
        description="Need assignment"
      />
      <CustomCard isHoverable onClick={onRunAiScheduler} className="cursor-pointer">
        <div className="flex items-center">
          <div className="p-2 mr-4 rounded-full bg-scheduler-primary/20">
            <Brain className="h-5 w-5 text-scheduler-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">AI Scheduler</p>
            <h3 className="text-base font-bold">Run Now</h3>
            <p className="text-xs mt-1 text-muted-foreground">Last run: {lastAiSchedule}</p>
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default OwnerMetricsCards;
