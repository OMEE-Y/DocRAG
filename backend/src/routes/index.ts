import { Router } from "express";
import multer from "multer";
import Groq from "groq-sdk";
import { ingestPDF } from "../ingest";
import { retrieve } from "../retrieve";

const router = Router();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded." });

    await ingestPDF(req.file.path);

    return res.status(200).json({
      message: ` Successfully indexed "${req.file.originalname}". Ask me anything!`,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/chat", async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim())
      return res.status(400).json({ answer: "Empty query." });

    const relevantChunks = retrieve(message);

    if (relevantChunks.length === 0) {
      return res.status(200).json({
        answer:
          "I couldn't find any relevant context in the document to answer that.",
      });
    }

    const contextBody = relevantChunks.map((c) => c.text).join("\n\n");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            `You are an AI assistant answering questions about an uploaded document.\n` +
            `Use ONLY the following document context to answer the user's question.\n` +
            `Keep your response natural, conversational, and direct. Do not mention "based on the context provided" explicitly.\n\n` +
            `[DOCUMENT CONTEXT]:\n${contextBody}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });

    const aiAnswer =
      chatCompletion.choices[0]?.message?.content || "No response received.";

    return res.status(200).json({ answer: aiAnswer });
  } catch (error) {
    next(error);
  }
});

export { router };
