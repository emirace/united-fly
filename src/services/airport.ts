import { IAirport } from "../context/airport";
import api from "./api";

export const getAllAirports = async () => {
  const response = await api.get("/airports");
  return response.data;
};

export const getAirportById = async (id: string) => {
  const response = await api.get(`/airports?id=${id}`);
  return response.data;
};

export const createAirport = async (airportData: Partial<IAirport>) => {
  const response = await api.post("/airports", airportData);
  return response.data;
};

export const updateAirport = async (
  id: string,
  updateData: Partial<IAirport>
) => {
  const response = await api.put("/airports", { id, ...updateData });
  return response.data;
};

export const deleteAirport = async (id: string) => {
  const response = await api.delete("/airports", { data: { id } });
  return response.data;
};
