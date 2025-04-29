import { supabase } from '@/integrations/supabase/client';
import type { TypedSupabaseClient } from '@/types/supabase';

// Auth types
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'Owner' | 'Employee';
};

type UserRow = {
  user_id: number;
  email: string;
  name: string;
  role: string;
  password_hash: string;
};

type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string; details: string; hint: string } | null;
};

// Login function using Supabase
export const login = async (email: string, password: string, role: 'Owner' | 'Employee'): Promise<AuthUser> => {
  try {
    // First, check if the user exists with the given email
    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, name, role, password_hash')
      .eq('email', email)
      .single() as { data: UserRow | null; error: any };

    if (error || !data) {
      throw new Error('Invalid credentials');
    }

    // Check if the role matches (case-insensitive)
    if (data.role.toLowerCase() !== role.toLowerCase()) {
      throw new Error('Invalid role');
    }

    // Check if the password hash matches
    if (data.password_hash !== `hash_${password}`) {
      throw new Error('Invalid credentials');
    }

    const authUser: AuthUser = {
      id: String(data.user_id),
      email: data.email,
      name: data.name,
      role: data.role as 'Owner' | 'Employee'
    };

    // Store in localStorage for persistence
    localStorage.setItem('authUser', JSON.stringify(authUser));
    return authUser;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid credentials');
  }
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
