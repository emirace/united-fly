import { ISetting } from "../context/setting";
import api from "./api";

export const fetchSettingsService = async (): Promise<ISetting> => {
  const res = await api.get("/settings");
  return res.data;
};

export const updateSettingsService = async (
  data: ISetting
): Promise<ISetting> => {
  const res = await api.put("/settings", data);
  return res.data;
};
