import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getBackendErrorMessage } from "../utils/error";

// The API now lives in this same Next.js app under /api, so every request is
// same-origin and there is no base host to configure.
export const baseURL = "";
export const imageUrl = "";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error Response:", error.response.data);
    } else if (error.request) {
      console.error("API No Response:", error.request);
    } else {
      console.error("API Request Error:", error.message);
    }
    return Promise.reject(getBackendErrorMessage(error));
  }
);

export default api;
