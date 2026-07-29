import { IBooking } from "../context/booking";
import api from "./api";

// Create a booking
export const createBooking = async (
  userId: string,
  flightId: string,
  seatId: string
): Promise<IBooking> => {
  const response = await api.post<IBooking>("/bookings", {
    userId,
    flightId,
    seatId,
  });
  return response.data;
};

// Get booking details by ID
export const getBookingById = async (id: string): Promise<IBooking> => {
  const response = await api.get<IBooking>(`${"/bookings"}/${id}`);
  return response.data;
};

export const getBookingByBookingId = async (
  bookingId: string
): Promise<IBooking> => {
  const response = await api.post<IBooking>(`${"/bookings/track"}`, {
    bookingId,
  });
  return response.data;
};

// Cancel a booking
export const cancelBooking = async (id: string): Promise<IBooking> => {
  const response = await api.put<IBooking>(`${"/bookings"}/${id}/cancel`);
  return response.data;
};

// Check in for a flight
export const checkInBooking = async (id: string): Promise<IBooking> => {
  const response = await api.put<IBooking>(`${"/bookings"}/${id}/check-in`);
  return response.data;
};

// Get all bookings of a user
export const getUserBookings = async (): Promise<IBooking[]> => {
  const response = await api.get<IBooking[]>(`/bookings/user`);
  return response.data;
};

export const getBookings = async (): Promise<IBooking[]> => {
  const response = await api.get<IBooking[]>(`/bookings`);
  return response.data;
};
