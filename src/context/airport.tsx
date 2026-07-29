"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getAllAirports,
  getAirportById,
  createAirport,
  updateAirport,
  deleteAirport,
} from "../services/airport";

export interface IAirport {
  _id?: string;
  name: string;
  code: string;
  city: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AirportContextType {
  airports: IAirport[];
  loading: boolean;
  fetchAirports: () => Promise<void>;
  getAirport: (id: string) => Promise<IAirport>;
  addAirport: (
    airportData: Omit<IAirport, "createdAt" | "updatedAt">
  ) => Promise<void>;
  editAirport: (
    id: string,
    updateData: Omit<IAirport, "createdAt" | "updatedAt">
  ) => Promise<void>;
  removeAirport: (id: string) => Promise<void>;
}

const AirportContext = createContext<AirportContextType | undefined>(undefined);

export const AirportProvider = ({ children }: { children: ReactNode }) => {
  const [airports, setAirports] = useState<IAirport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAirports = async () => {
    setLoading(true);
    try {
      const data = await getAllAirports();
      setAirports(data);
    } catch (error) {
      console.error("Error fetching airports:", error);
    }
    setLoading(false);
  };

  // Fetch all airports on mount
  useEffect(() => {
    fetchAirports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAirport = async (id: string): Promise<IAirport> => {
    try {
      return await getAirportById(id);
    } catch (error) {
      console.error("Error fetching airport:", error);
      throw error;
    }
  };

  const addAirport = async (
    airportData: Omit<IAirport, "createdAt" | "updatedAt">
  ) => {
    try {
      await createAirport(airportData);
      await fetchAirports(); // Refresh the list after adding
    } catch (error) {
      console.error("Error adding airport:", error);
    }
  };

  const editAirport = async (
    id: string,
    updateData: Omit<IAirport, "createdAt" | "updatedAt">
  ) => {
    try {
      await updateAirport(id, updateData);
      await fetchAirports(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating airport:", error);
    }
  };

  const removeAirport = async (id: string) => {
    try {
      await deleteAirport(id);
      await fetchAirports(); // Refresh the list after deleting
    } catch (error) {
      console.error("Error deleting airport:", error);
    }
  };

  return (
    <AirportContext.Provider
      value={{
        airports,
        loading,
        fetchAirports,
        getAirport,
        addAirport,
        editAirport,
        removeAirport,
      }}
    >
      {children}
    </AirportContext.Provider>
  );
};

export const useAirport = () => {
  const context = useContext(AirportContext);
  if (!context) {
    throw new Error("useAirport must be used within an AirportProvider");
  }
  return context;
};
