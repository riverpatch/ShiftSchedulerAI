
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CustomButton from '@/components/ui/CustomButton';

const NavigationHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-scheduler-primary">AI Shift Scheduler</h1>
          
          {user && user.role === 'Owner' && (
            <nav className="ml-8 hidden md:flex">
              <a href="/owner/dashboard" className="px-3 py-1 text-sm hover:text-scheduler-primary">
                Dashboard
              </a>
              <a href="/owner/schedule" className="px-3 py-1 text-sm hover:text-scheduler-primary">
                Schedule
              </a>
              <a href="/owner/employees" className="px-3 py-1 text-sm hover:text-scheduler-primary">
                Employees
              </a>
            </nav>
          )}
          
          {user && user.role === 'Employee' && (
            <nav className="ml-8 hidden md:flex">
              <a href="/employee/dashboard" className="px-3 py-1 text-sm hover:text-scheduler-primary">
                Dashboard
              </a>
              <a href="/employee/leave" className="px-3 py-1 text-sm hover:text-scheduler-primary">
                Leave
              </a>
            </nav>
          )}
        </div>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-sm bg-muted/40 hover:bg-muted px-3 py-1.5 rounded-full">
                <User className="h-4 w-4 mr-2" />
                {user.name}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <CustomButton variant="primary" size="sm" onClick={() => navigate('/')}>
            Sign In
          </CustomButton>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;
