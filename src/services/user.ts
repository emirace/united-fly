import {
  IGetAllUsersResponse,
  IGuestUser,
  IProfileData,
  IUser,
} from "../types/user";
import { getBackendErrorMessage } from "../utils/error";
import api from "./api";
import apiChat, { CHAT_TOKEN_KEY } from "./apiChat";

export const getUserProfile = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const updateUserProfile = async (profileData: IProfileData) => {
  const response = await api.put("/users/update", profileData);
  return response.data;
};

export const updateUserById = async (id: string, profileData: IProfileData) => {
  const response = await api.put(`/users/${id}`, profileData);
  return response.data;
};

export const inviteUser = async (email: string) => {
  const response = await api.post("/users/invite", { email });
  return response.data;
};

export const fetchAllUsers = async (data: {
  page: number;
  limit: number;
  search: string;
}): Promise<IGetAllUsersResponse> => {
  try {
    const response = await api.get<IGetAllUsersResponse>("/users/all", {
      params: { ...data },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export async function loginGuestService(userData: IGuestUser): Promise<IUser> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: { guestUser: any; status: boolean } = await apiChat.post(
      `/users/login-guest`,
      userData
    );

    console.log(response);
    if (!response.status) {
      // Handle all users error, e.g., display an error message to the user
      throw new Error("Update failed: " + getBackendErrorMessage(response));
    }
    localStorage.setItem("guestUserEmail", userData.email);
    localStorage.setItem("guestUserFullName", userData.fullName);
    // Guest tokens are kept apart from `authToken` — see apiChat.ts.
    localStorage.setItem(CHAT_TOKEN_KEY, response.guestUser.token);

    return response.guestUser;
  } catch (error) {
    console.log(error);
    // Handle network errors or other exceptions
    // You can log the error or perform other error-handling actions
    console.error("creating guest user error:", getBackendErrorMessage(error));

    // Re-throw the error to propagate it up the call stack if needed
    throw getBackendErrorMessage(error);
  }
}
