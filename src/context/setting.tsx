"use client";

// SettingContext.tsx
import React, { createContext, useState, ReactNode, useContext } from "react";
import {
  fetchSettingsService,
  updateSettingsService,
} from "../services/setting";

interface Props {
  children: ReactNode;
}
export interface ISetting {
  bankingInfo: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    routing: string;
    address: string;
  };
  cryptoInfo: {
    name: string;
    network: string;
    address: string;
    rate: number;
  }[];
  mail: {
    name: string;
    password: string;
  };
  cashApp: {
    tag: string;
    name: string;
  };
  whatsApp: string;
}

interface SettingContextProps {
  settings: ISetting;
  fetchSettings: () => Promise<void>;
  updateSettinngs: (value: ISetting) => Promise<void>;
}

export const SettingContext = createContext<SettingContextProps | undefined>(
  undefined
);

export const SettingProvider: React.FC<Props> = ({ children }) => {
  const [settings, setSettings] = useState<ISetting>({
    bankingInfo: {
      accountNumber: "",
      accountName: "",
      bankName: "",
      routing: "",
      address: "",
    },
    cryptoInfo: [
      {
        name: "",
        network: "",
        address: "",
        rate: 0,
      },
    ],
    mail: {
      name: "",
      password: "",
    },
    cashApp: {
      tag: "",
      name: "",
    },
    whatsApp: "",
  });

  const fetchSettings = async () => {
    try {
      const res = await fetchSettingsService();
      setSettings(res);
    } catch (error) {
      throw error;
    }
  };

  const updateSettinngs = async (value: ISetting) => {
    try {
      const res = await updateSettingsService(value);
      setSettings(res);
    } catch (error) {
      throw error;
    }
  };

  return (
    <SettingContext.Provider
      value={{ settings, fetchSettings, updateSettinngs }}
    >
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error("useSetting must be used within a SettingProvider");
  }
  return context;
};
