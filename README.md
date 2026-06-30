

# Document RAG Chatbot 

A lightweight, high-performance Retrieval-Augmented Generation (RAG) chatbot built with TypeScript, Express, and Groq. The system handles raw document parsing, indexes the text fragments locally via a keyword-based matching strategy, and leverages Groq's low-latency inference engine to synthesize contextually accurate conversational responses.

---

## Technical Stack

* **Runtime Environment:** Node.js, TypeScript
* **API Framework:** Express, Cors, Helmet
* **File Processing:** Multer
* **Inference Engine:** Groq Cloud SDK (Model: `llama-3.1-8b-instant`)

---

## Architectural Layout

### System Component Diagram

```text
  +------------------------------------------------------------------------+
  |                             CLIENT SIDE                                |
  |   +-----------------------+              +-------------------------+   |
  |   |   Document Uploader   |              |     Chat Interface      |   |
  +---+-----------+-----------+--------------+------------+------------+---+
                  |                                       ^
  HTTP POST       | multipart/form-data                   | HTTP POST
  (/api/upload)   |                                       | (/api/chat)
                  v                                       v
  +---------------+---------------------------------------+----------------+
  |                             BACKEND API                                |
  |                                                                        |
  |   +-----------------------+              +-------------------------+   |
  |   |   Multer Middleware   |              |     Express Router      |   |
  |   +-----------+-----------+              +------------+------------+   |
  |               |                                       |                |
  |               v                                       v                |
  |   +-----------------------+              +-------------------------+   |
  |   |   Ingestion Engine    |              |    Retrieval Engine     |   |
  |   |     (ingest.ts)       |              |      (retrieve.ts)      |   |
  |   +-----------+-----------+              +------------+------------+   |
  |               |                                       ^                |
  +---------------+---------------------------------------+----------------+
                  |                                       |
                  | Populates                             | Queries
                  v                                       |
  +---------------+---------------------------------------+----------------+
  |                          DATA & INFERENCE LAYER                        |
  |                                                                        |
  |                   +-------------------------------+                    |
  |                   |    In-Memory Text Index       |                    |
  |                   |  (Segmented Context Chunks)   |                    |
  |                   +-------------------------------+                    |
  |                                   |                                    |
  |                                   v Injected Context Chunks            |
  |                   +-------------------------------+                    |
  |                   |       Groq API Pipeline       |                    |
  |                   |   (llama-3.1-8b-instant)      |                    |
  |                   +-------------------------------+                    |
  +------------------------------------------------------------------------+

```

### Request Pipeline & Data Flow

#### 1. Ingestion Pipeline

1. Client issues a `POST` request containing a PDF file to `/api/upload`.
2. `multer` intercepts the stream and writes the file temporarily to the filesystem.
3. `ingestPDF()` extracts raw strings from the document, processes the text into predictable segment lengths (chunks), and inserts them directly into the search index structure.

#### 2. Retrieval-Augmented Generation (RAG) Pipeline

1. Client issues a JSON `POST` containing a user prompt to `/api/chat`.
2. The `retrieve()` method parses the query string, executes token/keyword scanning across the local index, and returns the top-scoring matched text chunks.
3. The server builds a structured message payload, placing the matched text blocks into a strict system role context string.
4. The payload is pushed to Groq's serverless edge environment via the SDK using low-temperature configuration limits to eliminate model hallucinations.
5. The generated text output is unwrapped and delivered down to the client app.

---

## Getting Started

### 1. Prerequisites

Ensure Node.js (v18 or higher) and npm are accessible on your system path. A developer API token is required from the Groq Console.

### 2. Installation

Navigate to your repository subfolder and download package dependencies:

```bash
cd company-chatbot/backend
npm install

```

### 3. Environment Setup

Construct a `.env` configuration template file in the root root directory of your backend:

```env
PORT=5000
GROQ_API_KEY=gsk_your_actual_free_tier_groq_key_here

```

### 4. Running the Project Engine

Boot the application development execution server with file hot-reloading configurations enabled:

```bash
npm run dev

```


## File System Structure

```text
├── src/
│   ├── routes/
│   │   └── index.ts          # API Route configuration map definitions
│   ├── middleware/
│   │   ├── logger.ts         # Consolidated request log processor
│   │   └── errorHandler.ts   # Error catch block payload normalization
│   ├── ingest.ts             # Raw data layout mapping algorithms
│   ├── retrieve.ts           # Token/Keyword index scanning engine
│   ├── app.ts                # Middleware configuration pipeline setup
│   └── server.ts             # Process listener instantiation hook
├── .env                      # Application environment property profiles
├── tsconfig.json             # TypeScript structural target constraints
└── package.json

```
