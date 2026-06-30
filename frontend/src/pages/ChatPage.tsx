import { useState, useRef, useEffect } from "react";
import { api } from "../api/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      // Simulate/Trigger a temporary system notification in chat log
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⏳ Processing and indexing "${file.name}" for RAG context...`,
        },
      ]);

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            res.data.message ||
            `✅ Successfully indexed "${file.name}". You can now ask questions about it!`,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "❌ Failed to upload and process document.",
        },
      ]);
    } finally {
      setUploading(false);
      e.target.value = ""; // Clear input slot
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: userMessage.content,
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.data.answer || "No response received.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      {/* Clean Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoSquare} />
          <h1 style={styles.title}>Company Chatbot</h1>
        </div>
        <span style={styles.badge}>v1.0.0</span>
      </header>

      {/* Chat History Area */}
      <div style={styles.chatArea}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              Welcome back. Upload business PDFs or query your existing
              knowledge base instantly.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                backgroundColor:
                  msg.role === "user" ? "transparent" : "#111111",
                borderBottom:
                  msg.role === "user" ? "none" : "1px solid #1e1e1e",
              }}
            >
              <div style={styles.messageContent}>
                <span
                  style={{
                    ...styles.roleLabel,
                    color: msg.role === "user" ? "#ededed" : "#3ecf8e",
                  }}
                >
                  {msg.role === "user" ? "You" : "AI"}
                </span>
                <p style={styles.messageText}>{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div style={{ ...styles.messageRow, backgroundColor: "#111111" }}>
            <div style={styles.messageContent}>
              <span style={{ ...styles.roleLabel, color: "#3ecf8e" }}>AI</span>
              <div style={styles.loadingDots}>
                <span style={styles.dot}>.</span>
                <span style={styles.dot}>.</span>
                <span style={styles.dot}>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Dock with Embedded Clip Action */}
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          {/* Hidden File System Input */}
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={uploadFile}
            style={{ display: "none" }}
          />

          {/* Paperclip Action Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Upload PDF Context"
            style={{
              ...styles.clipButton,
              opacity: uploading ? 0.4 : 1,
            }}
          >
            {uploading ? "⏳" : "📎"}
          </button>

          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              uploading ? "Processing document..." : "Ask your data anything..."
            }
            style={styles.textarea}
            disabled={loading || uploading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || uploading || !input.trim()}
            style={{
              ...styles.button,
              opacity: loading || uploading || !input.trim() ? 0.4 : 1,
              cursor:
                loading || uploading || !input.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#0a0a0a",
    color: "#ededed",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #1e1e1e",
    backgroundColor: "#000000",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoSquare: {
    width: "16px",
    height: "16px",
    backgroundColor: "#fff",
    transform: "rotate(45deg)",
  },
  title: {
    fontSize: "14px",
    fontWeight: 500,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  badge: {
    fontSize: "11px",
    fontFamily: "monospace",
    color: "#666",
    backgroundColor: "#111",
    padding: "2px 6px",
    borderRadius: "4px",
    border: "1px solid #1e1e1e",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  emptyText: {
    color: "#666",
    fontSize: "14px",
    textAlign: "center",
    maxWidth: "430px",
    lineHeight: "1.5",
  },
  messageRow: {
    padding: "24px",
    borderBottom: "1px solid #1e1e1e",
  },
  messageContent: {
    maxWidth: "768px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  roleLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "monospace",
  },
  messageText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#d4d4d4",
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  inputContainer: {
    padding: "24px",
    background: "linear-gradient(to top, #000 60%, transparent)",
  },
  inputWrapper: {
    maxWidth: "768px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#111111",
    border: "1px solid #1e1e1e",
    borderRadius: "8px",
    padding: "10px 14px",
    gap: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
  },
  clipButton: {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.1s ease",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    paddingTop: "2px",
  },
  button: {
    backgroundColor: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: 500,
  },
  loadingDots: {
    fontSize: "18px",
    color: "#666",
    display: "flex",
    gap: "2px",
    marginTop: "-4px",
  },
  dot: {
    animation: "none",
  },
};
