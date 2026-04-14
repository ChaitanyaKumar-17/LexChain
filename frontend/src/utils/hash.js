export const generateFileHash = async (file) => {
  // 1. Read the file into memory as a buffer of raw data
  const arrayBuffer = await file.arrayBuffer();

  // 2. Use the browser's native crypto API to generate a SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  // 3. Convert the raw buffer into a readable hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};
