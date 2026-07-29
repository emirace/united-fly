import api from "./api";

export const sendEmail = async (
  to: string,
  message: string,
  subject: string
) => {
  const response = await api.post("/emails", {
    to,
    message,
    subject,
  });
  return response.data;
};
