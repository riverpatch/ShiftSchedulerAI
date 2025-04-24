
import { users } from './mockData';

// Auth types
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'Owner' | 'Employee';
};

// Mock login function
export const login = async (email: string, password: string, role: 'Owner' | 'Employee'): Promise<AuthUser> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app, we would validate the password here
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
      
      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
        // Store in localStorage for persistence (mock session)
        localStorage.setItem('authUser', JSON.stringify(authUser));
        resolve(authUser);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 800); // Simulate network delay
  });
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const authUser = localStorage.getItem('authUser');
  return !!authUser;
};

// Get current authenticated user
export const getCurrentUser = (): AuthUser | null => {
  const authUser = localStorage.getItem('authUser');
  return authUser ? JSON.parse(authUser) : null;
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('authUser');
};
