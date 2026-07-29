import { ISeat } from "../context/booking";
import { IFlight, IFlightData } from "../context/flight";
import api from "./api";

export const getFlights = async (
  filters: Record<string, string>
): Promise<IFlight[]> => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get<IFlight[]>(`/flights?${params}`);
  return response.data;
};

export const addFlight = async (flightData: IFlightData): Promise<IFlight> => {
  const response = await api.post<IFlight>("/flights", flightData);
  return response.data;
};

export const getFlightById = async (id: string): Promise<IFlight> => {
  const response = await api.get<IFlight>(`/flights/${id}`);
  return response.data;
};

/** Seats already booked on a flight, used to grey out the seat map. */
export const getSeats = async (id: string): Promise<ISeat[]> => {
  const response = await api.get<ISeat[]>(`/flights/${id}/seat`);
  return response.data;
};

export const updateFlight = async (
  id: string,
  flightData: Partial<IFlight>
): Promise<IFlight> => {
  const response = await api.put<IFlight>(`flights/${id}`, flightData, {
    // headers: {
    //   Authorization: `Bearer ${token}`,
    //   "Content-Type": "application/json",
    // },
  });
  return response.data;
};

export const deleteFlight = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/flights/${id}`);
  return response.data;
};
