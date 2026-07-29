import { saveImageService } from "../services/image";

export const compressImageUpload = async (
  file: File,
  maxSize: number,
  image?: string
) => {
  // Create an HTMLImageElement to get the original dimensions of the image

  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise((resolve, reject) => {
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(null);
    };
    img.onerror = reject;
  });
  const { width, height } = img;

  // Resize the image if necessary
  if (width > maxSize || height > maxSize) {
    const aspectRatio = width / height;
    let newWidth, newHeight;
    if (aspectRatio >= 1) {
      newWidth = maxSize;
      newHeight = maxSize / aspectRatio;
    } else {
      newHeight = maxSize;
      newWidth = maxSize * aspectRatio;
    }
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas found");
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    const resizedBlob: BlobPart = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob !== null) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        },
        file.type,
        0.9
      );
    });

    file = new File([resizedBlob], file.name, { type: file.type });
  }

  // Upload the resized image using axios
  const formData = new FormData();
  formData.append("image", file);
  if (image) formData.append("deleteImage", image);

  try {
    const url = await saveImageService(formData);
    return url;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(error as any);
  }
};
