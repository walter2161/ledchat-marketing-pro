import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserContextType } from "@/types/user";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = "ledchat_user";

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const userWithDates = {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
        };
        setUser(userWithDates);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const updateUser = (userData: Partial<User>) => {
    if (!user) {
      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        name: userData.name || "Usuário",
        email: userData.email,
        avatar: userData.avatar,
        createdAt: new Date(),
      };
      setUser(newUser);
    } else {
      // Update existing user
      setUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (user) {
      setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        updateAvatar,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}