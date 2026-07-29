import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getBackendErrorMessage } from "../utils/error";

/**
 * Chat/support client. It talks to the same origin as `api`, but keeps its own
 * instance for two reasons:
 *
 *  - the chat endpoints unwrap to `response.data` directly, and
 *  - an anonymous visitor authenticates with a *guest* token, which must never
 *    be written to `authToken`. The chat service used to be a separate server
 *    signing with a different secret, so a stray guest token was simply
 *    rejected by the main API. Now that there is one secret, a guest token in
 *    `authToken` would make the app believe an anonymous visitor is signed in.
 *    Guests therefore live under `chatToken`.
 */
export const CHAT_TOKEN_KEY = "chatToken";

export const getChatToken = () =>
  localStorage.getItem("authToken") || localStorage.getItem(CHAT_TOKEN_KEY);

const apiChat = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiChat.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getChatToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiChat.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
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

export default apiChat;
