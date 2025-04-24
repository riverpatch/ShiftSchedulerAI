
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/ui/CustomButton';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scheduler-light via-white to-accent p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-scheduler-primary">404</h1>
        <p className="text-xl text-gray-700 mt-4 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <CustomButton variant="primary" onClick={() => navigate('/')}>
          Return to Home
        </CustomButton>
      </div>
    </div>
  );
};

export default NotFound;
