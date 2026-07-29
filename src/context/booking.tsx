"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  createBooking,
  cancelBooking,
  checkInBooking,
  getUserBookings,
  getBookings,
} from "../services/booking";
import { IFlight, IPassenger } from "./flight";
import { IUser } from "../types/user";

export interface ISeat {
  flightId: string;
  seatNumber: string;
  class: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  _id: string;
  userId: IUser;
  bookingId: string;
  class: string;
  flightId: IFlight;
  seatId: ISeat[];
  status: string;
  paymentStatus: string;
  createdAt: string;
  /** Persisted copies of the passenger forms captured at checkout. */
  travellers: IPassenger[];
}

interface BookingContextType {
  bookings: IBooking[];
  loading: boolean;
  fetchUserBookings: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  createNewBooking: (
    userId: string,
    flightId: string,
    seatId: string
  ) => Promise<void>;
  cancelUserBooking: (id: string) => Promise<void>;
  checkInUserBooking: (id: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createNewBooking = async (
    userId: string,
    flightId: string,
    seatId: string
  ) => {
    try {
      await createBooking(userId, flightId, seatId);
      fetchUserBookings();
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  };

  const cancelUserBooking = async (id: string) => {
    try {
      const updatedBooking = await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? updatedBooking : b))
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const checkInUserBooking = async (id: string) => {
    try {
      const updatedBooking = await checkInBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? updatedBooking : b))
      );
    } catch (error) {
      console.error("Error checking in booking:", error);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        fetchUserBookings,
        fetchBookings,
        createNewBooking,
        cancelUserBooking,
        checkInUserBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
