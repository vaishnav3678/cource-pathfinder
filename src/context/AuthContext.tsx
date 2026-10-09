import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (identifier: string, password: string, expectedRole?: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  resetPasswordRequest: (email: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'pathfinder_current_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const login = async (
    identifier: string,
    password: string,
    expectedRole?: UserRole
  ): Promise<{ success: boolean; message: string }> => {
    if (!identifier.trim()) {
      return { success: false, message: 'Please enter your username or email address.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    const authRes = await storage.authenticate(identifier, password);
    if (!authRes.success || !authRes.user) {
      return { success: false, message: authRes.message };
    }

    const authenticatedUser = authRes.user;

    // Strict role check
    if (expectedRole && authenticatedUser.role !== expectedRole) {
      return {
        success: false,
        message:
          expectedRole === 'admin'
            ? 'Access restricted. Administrator credentials required.'
            : 'Access restricted. Please use the Student Portal.',
      };
    }

    setUser(authenticatedUser);
    return {
      success: true,
      message: `Welcome, ${authenticatedUser.name}!`,
    };
  };

  const logout = () => {
    if (user) {
      storage.logAction('AUTH_LOGOUT', `User ${user.email} logged out`, user.email, 'auth');
    }
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    storage.saveUser(updated);
  };

  const resetPasswordRequest = async (email: string): Promise<{ success: boolean; message: string }> => {
    const found = storage.findUserByIdentifier(email);
    if (!found) {
      return {
        success: false,
        message: 'No registered user found with this email address.',
      };
    }

    storage.logAction(
      'PASSWORD_RESET_DISPATCHED',
      `Password reset dispatched to ${email}`,
      email,
      'auth'
    );

    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}.`,
    };
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Must be logged in to update password.' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    await storage.resetStudentPassword(user.id, newPassword, user.email);
    return { success: true, message: 'Password updated successfully.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        logout,
        updateProfile,
        resetPasswordRequest,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
