import { ChatGroq } from "@langchain/groq";
import { env } from "./env";

export const llm = new ChatGroq({
  apiKey: env.groqApiKey,
  model: env.modelName,
  temperature: 0.3,
});
