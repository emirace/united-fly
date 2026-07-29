"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getUserProfile, updateUserProfile } from "../services/user";
import { IProfileData, IUser } from "../types/user";

// Define the context types
interface UserContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  getUser: () => Promise<void>;
  updateUser: (profileData: IProfileData) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value of null
const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider Component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the user profile
  const getUser = async () => {
    try {
      const data = await getUserProfile();
      setUser(data);
    } catch (err: unknown) {
      throw err;
    }
  };

  // Function to update the user profile
  const updateUser = async (profileData: IProfileData) => {
    try {
      const updatedUser = await updateUserProfile(profileData);
      setUser(updatedUser);
    } catch (err: unknown) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    // googleLogout();
    localStorage.removeItem("authToken");
  };

  // Fetch the user profile when the component is mounted
  useEffect(() => {
    setLoading(true);
    getUser()
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch user profile");
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider
      value={{ user, loading, error, getUser, updateUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
