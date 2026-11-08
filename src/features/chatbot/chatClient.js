import { getToken, requestRaw } from "../../data/api";

// Is the AI helper (LM Studio) running?
export async function chatStatus() {
  const { ok, data } = await requestRaw("/api/chat/status");
  return ok && data.online === true;
}

// Sends the conversation to the backend and calls onToken(text) for every piece of the answer as it arrives.
export async function streamChat({ messages, page, onToken, signal }) {
  let response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ messages, page }),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Can't reach the server. Is the backend running?");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(response.status === 401 ? "Please log in again to chat." : data.message ?? "The AI helper couldn't answer.");
  }

  // LM Studio streams "data: {json}" lines (the OpenAI format) and ends with "data: [DONE]"
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const text = line.trim();
      if (!text.startsWith("data:")) continue;
      const payload = text.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const piece = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (piece) onToken(piece);
      } catch {
        /* a half-sent line: ignore */
      }
    }
  }
}
