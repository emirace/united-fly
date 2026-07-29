import api from "./api";

interface IUserData {
  fullName: string;
  email: string;
  password: string;
}
export const registerUser = async (userData: IUserData) => {
  const response = await api.post("/auths/register", userData);
  return response.data;
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auths/login", credentials);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auths/forgotpassword", { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await api.put(`/auths/resetpassword/${token}`, {
    password: newPassword,
  });
  return response.data;
};

export const sendVerificationEmail = async () => {
  const response = await api.post("/auths/sendverificationemail");
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.get(`/auths/verifyemail/${token}`);
  return response.data;
};

export const sendContactUs = async (data: {
  email: string;
  name: string;
  message: string;
}) => {
  const response = await api.post(`/auths/contact`, data);
  return response.data;
};
