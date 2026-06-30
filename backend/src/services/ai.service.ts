import Groq from "groq-sdk";
import { env } from "../config/env";

const groq = new Groq({
  apiKey: env.groqApiKey,
});

export async function askGroq(message: string) {
  const completion = await groq.chat.completions.create({
    model: env.modelName,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content ?? "No response";
}
