
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This page just redirects to the login
const Index: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-scheduler-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default Index;
