import api from "./api";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB — keeps the base64 payload well under the server's body-size limit

// Uploads a File (or a recorded voice-note Blob) to Cloudinary via the
// backend and returns an attachment object ready to send with a message:
// { url, type, name, size }.
export async function uploadChatFile(file) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is too large (max 10MB).");
  }
  const fileBase64 = await fileToBase64(file);
  try {
    const { data } = await api.post("/chat/upload", {
      fileBase64,
      fileName: file.name || "voice-note",
    });
    return data;
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      throw new Error(
        "Upload timed out — the server couldn't reach the file storage service in time."
      );
    }
    throw err;
  }
}