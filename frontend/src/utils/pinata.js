import axios from "axios";

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
    });
    
    // Returns the IPFS hash (CID)
    return res.data.IpfsHash; 
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw new Error("Failed to upload file to IPFS");
  }
};