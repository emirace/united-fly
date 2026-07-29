import { IPayment } from "../context/payment";
import api from "./api";

interface ProcessPaymentParams {
  seatNumber: string[];
  flightId: string;
  classType: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  travellers: object[];
  confirmEmail: string;
}

// Get all payments (Admin)
export const getAllPayments = async (): Promise<IPayment[]> => {
  const response = await api.get<IPayment[]>("/payments");
  return response.data;
};

// Get payment by ID
export const getPaymentById = async (id: string): Promise<IPayment> => {
  const response = await api.get<IPayment>(`/payments/${id}`);
  return response.data;
};

export const getPaymentByToken = async (token: string): Promise<IPayment> => {
  const response = await api.get<IPayment>(`/payments/token/${token}`);
  return response.data;
};

// Update payment status
export const updatePaymentStatus = async (
  id: string,
  status: string,
  reason?: string
): Promise<IPayment> => {
  const response = await api.put<IPayment>(`/payments/${id}`, {
    status,
    reason,
  });
  return response.data;
};

export const updatePaymentImage = async (
  token: string,
  image: string
): Promise<IPayment> => {
  const response = await api.put<IPayment>(`/payments/token/${token}`, {
    image,
  });
  return response.data;
};

export const getUserPayments = async (): Promise<IPayment[]> => {
  const response = await api.get<IPayment[]>(`/payments/user`);
  return response.data;
};

export const processPayment = async (paymentData: ProcessPaymentParams) => {
  const response = await api.post("/payments", paymentData);
  return response.data;
};

export const generatePaymentLink = async (
  paymentData: ProcessPaymentParams
) => {
  const response = await api.post("/payments/generate", paymentData);
  return response.data;
};
