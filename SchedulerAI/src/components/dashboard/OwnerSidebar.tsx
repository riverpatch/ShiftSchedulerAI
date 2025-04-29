import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  Brain,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/owner",
    icon: LayoutDashboard,
  },
  {
    name: "Shift Allocations",
    href: "/owner/shifts",
    icon: Calendar,
  },
  {
    name: "Leave Requests",
    href: "/owner/leaves",
    icon: FileText,
  },
  {
    name: "Schedule Overview",
    href: "/owner/schedule",
    icon: Calendar,
  },
  {
    name: "Employee Management",
    href: "/owner/employees",
    icon: Users,
  },
  {
    name: "Messaging",
    href: "/owner/messages",
    icon: MessageSquare,
  },
  {
    name: "AI Settings",
    href: "/owner/ai-settings",
    icon: Brain,
  },
];

const OwnerSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-[#f2fdff] overflow-y-auto border-r border-primary">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-[#001140]">
            AI Scheduler
          </h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                    isActive
                      ? "bg-[#261e67]/10 text-[#001140]"
                      : "text-[#6f7d7f] hover:bg-[#e6f2f9] hover:text-[#001140]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive
                        ? "text-[#001140]"
                        : "text-[#6f7d7f] group-hover:text-[#001140]"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-primary p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <Settings className="h-5 w-5 text-[#6f7d7f] group-hover:text-[#001140]" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#6f7d7f] group-hover:text-[#001140]">
                  Settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSidebar;
