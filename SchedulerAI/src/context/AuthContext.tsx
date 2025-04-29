import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthUser, getCurrentUser, login, logout } from '../utils/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: 'Owner' | 'Employee') => Promise<AuthUser>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const loginHandler = async (email: string, password: string, role: 'Owner' | 'Employee') => {
    setIsLoading(true);
    try {
      const user = await login(email, password, role);
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logoutHandler = () => {
    logout();
    setUser(null);
  };
  
  const value = {
    user,
    login: loginHandler,
    logout: logoutHandler,
    isLoading,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
