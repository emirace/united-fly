"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  getUserPayments,
} from "../services/payment";
import { IBooking } from "./booking";
import { IUser } from "../types/user";

export interface IPayment {
  _id: string;
  bookingId: IBooking;
  userId: IUser;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
  image?: string;
}

interface PaymentContextType {
  fetchAllPayments: () => Promise<IPayment[]>;
  fetchUserPayments: () => Promise<IPayment[]>;
  fetchPaymentById: (id: string) => Promise<IPayment | null>;
  updateStatus: (id: string, status: string, reason?: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  // Fetch all payments (Admin)
  const fetchAllPayments = async () => {
    try {
      const data = await getAllPayments();
      return data;
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw error;
    }
  };

  // Fetch payments for a specific user
  const fetchUserPayments = async () => {
    try {
      const data = await getUserPayments();
      return data;
    } catch (error) {
      console.error("Error fetching user payments:", error);
      throw error;
    }
  };

  // Fetch payment by ID
  const fetchPaymentById = async (id: string): Promise<IPayment> => {
    try {
      return await getPaymentById(id);
    } catch (error) {
      console.error("Error fetching payment by ID:", error);
      throw error;
    }
  };

  // Update payment status
  const updateStatus = async (id: string, status: string, reason?: string) => {
    try {
      await updatePaymentStatus(id, status, reason);
      await fetchAllPayments();
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        fetchAllPayments,
        fetchUserPayments,
        fetchPaymentById,
        updateStatus,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook for using IPayment Context
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
