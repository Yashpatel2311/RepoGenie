export async function uploadFile(
  file: File,
  setProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}`,
      );

      const cloudinaryURL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", cloudinaryURL, true);

      // Show upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && setProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setProgress(progress);
        }
      });

      // Handle success or failure
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url as string);
        } else {
          const error = JSON.parse(xhr.responseText);
          console.error("Cloudinary error:", error); // ✅ shows actual issue
          reject(
            new Error(
              `Upload failed: ${error.error?.message || xhr.statusText}`,
            ),
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("An error occurred during the upload."));
      };

      // Log to debug
      console.log("Uploading to:", cloudinaryURL);
      console.log("Using preset:", "meetings");
      console.log("File:", file);

      xhr.send(formData);
    } catch (error) {
      reject(error);
    }
  });
}
