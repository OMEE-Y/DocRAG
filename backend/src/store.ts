export interface DocumentChunk {
  id: number;
  text: string;
}

// Global in-memory storage for document chunks
export const documentStore: DocumentChunk[] = [];
