import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "5000",
  groqApiKey: process.env.GROQ_API_KEY || "",
  modelName: process.env.MODEL_NAME || "llama-3.3-70b-versatile",
};
