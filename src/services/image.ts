import { getBackendErrorMessage } from "../utils/error";
import apiChat from "./apiChat";

/**
 * Uploads a chat attachment and returns the Cloudinary url it is served from.
 * `apiChat` unwraps to `response.data`, so the cast is against the endpoint's
 * payload rather than an Axios response.
 */
export const saveImageService = async (formData: FormData): Promise<string> => {
  try {
    const response = (await apiChat.post("/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })) as unknown as { imageUrl: string };

    return response.imageUrl;
  } catch (error) {
    console.error("Error uploading image:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};

/** Warms the API connection; the home page calls this on mount. */
export const ping = async () => {
  return apiChat.get("/images");
};
