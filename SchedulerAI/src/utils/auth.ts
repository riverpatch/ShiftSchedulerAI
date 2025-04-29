import { supabase } from '@/lib/supabase/client';
import type { Database, UserRole, UserStatus } from '@/lib/supabase/client';
import bcryptjs from 'bcryptjs';

// Auth types
export type AuthUser = {
  user_id: number;
  email: string;
  name: string;
  role: UserRole;
  priority_level: number | null;
  status: UserStatus;
};

// Login function using Supabase
export const login = async (email: string, password: string, role: UserRole): Promise<AuthUser> => {
  try {
    console.log('Attempting login with:', { email, role });

    type UserRow = Database['public']['Tables']['users']['Row'];

    // Check if the user exists with the given email and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .single<UserRow>();

    if (userError) {
      console.error('Database error:', userError);
      throw new Error('Database error occurred');
    }

    if (!userData) {
      console.error('No user found with email and role:', { email, role });
      throw new Error('Invalid credentials');
    }

    // Check if the user is active
    if (userData.status !== 'active') {
      console.error('User account inactive:', userData.status);
      throw new Error('Account is inactive');
    }

    // Verify password using bcryptjs
    const isValidPassword = await bcryptjs.compare(password, userData.password_hash);
    if (!isValidPassword) {
      console.error('Password mismatch');
      throw new Error('Invalid credentials');
    }

    const authUser: AuthUser = {
      user_id: userData.user_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      priority_level: userData.priority_level,
      status: userData.status
    };

    // Store in localStorage for persistence
    localStorage.setItem('authUser', JSON.stringify(authUser));
    console.log('Login successful:', { ...authUser });
    return authUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error instanceof Error ? error : new Error('Login failed');
  }
};

// Helper function to hash passwords (for user creation/registration)
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcryptjs.hash(password, saltRounds);
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
