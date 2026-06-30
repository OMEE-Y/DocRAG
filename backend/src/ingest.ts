import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { documentStore } from "./store";
import fs from "fs";

export async function ingestPDF(filePath: string): Promise<number> {
  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    const chunks = await splitter.splitDocuments(docs);

    // Clear previous context before storing new document
    documentStore.length = 0;

    chunks.forEach((doc, index) => {
      documentStore.push({
        id: index,
        text: doc.pageContent,
      });
    });

    return chunks.length;
  } finally {
    // Always clean up the temporary file from the disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
