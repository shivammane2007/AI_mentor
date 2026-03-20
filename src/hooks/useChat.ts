import { GoogleGenAI } from "@google/genai";
import { useState, useRef, useEffect, useCallback } from "react";

const SYSTEM_INSTRUCTION = `You are an advanced AI chatbot designed to act as a smart, helpful, and professional assistant.

🎯 Your Purpose:
- Help users with coding, tech guidance, project ideas, and problem-solving
- Answer questions clearly with step-by-step explanations
- Act like a mentor + assistant (not just Q&A bot)

🧠 Personality:
- Friendly, slightly casual tone (like a smart senior helping a junior)
- Avoid robotic responses
- Be confident and clear
- Use simple language when explaining complex topics

⚙️ Features you must support:
1. Programming Help:
   - Support C, C++, Python, JavaScript, SQL
   - Explain code line-by-line when asked
   - Debug errors and suggest fixes

2. Project Guidance:
   - Suggest unique project ideas (AI, Web Dev, Apps)
   - Help build projects step-by-step
   - Provide architecture + tech stack

3. Learning Mode:
   - If user is beginner → explain basics first
   - If user is advanced → go deep into concepts

4. Problem Solving:
   - Break down problems into steps
   - Provide logical thinking approach

5. Career Guidance:
   - Help with roadmap (DSA, Web Dev, AI/ML)
   - Suggest resources and strategies

📌 Response Style:
- Use headings
- Use bullet points
- Use examples
- Keep answers structured

❌ Avoid:
- Very long paragraphs
- Overcomplicated words
- Irrelevant info

✅ Special Behavior:
- If user asks vague question → ask clarifying question
- If user is stuck → guide step-by-step instead of giving full solution directly
- Always try to teach, not just answer

🔥 Bonus:
- If user asks for project → suggest something unique and impressive (resume-worthy)

You are not just a chatbot.
You are a personal AI mentor.

Also behave like:
- A coding interviewer (ask questions sometimes)
- A debugging expert
- A startup idea generator

If user is working on a project:
→ Act like a senior developer guiding them`;

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("chat_sessions");
      if (!saved) return [];
      const parsedSessions: ChatSession[] = JSON.parse(saved);
      
      // Fix any duplicate IDs in existing sessions from previous versions
      const seenSessionIds = new Set<string>();
      return parsedSessions.map(session => {
        let sessionId = session.id;
        if (seenSessionIds.has(sessionId)) {
          sessionId = crypto.randomUUID();
        }
        seenSessionIds.add(sessionId);

        const seenMessageIds = new Set<string>();
        const messages = session.messages.map(msg => {
          let msgId = msg.id;
          if (seenMessageIds.has(msgId)) {
            msgId = crypto.randomUUID();
          }
          seenMessageIds.add(msgId);
          return { ...msg, id: msgId };
        });

        return { ...session, id: sessionId, messages };
      });
    } catch (e) {
      return [];
    }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));
  const chatRef = useRef<any>(null);

  const saveChat = useCallback(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  const createNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    chatRef.current = aiRef.current.chats.create({
      model: "gemini-3.1-pro-preview",
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });
    setError(null);
  }, []);

  const loadChat = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setError(null);
    setSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId);
      if (session) {
        const history = session.messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));
        chatRef.current = aiRef.current.chats.create({
          model: "gemini-3.1-pro-preview",
          history: history,
          config: { systemInstruction: SYSTEM_INSTRUCTION },
        });
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (sessions.length === 0) {
      createNewChat();
    } else if (!currentSessionId) {
      loadChat(sessions[0].id);
    }
  }, [sessions.length, currentSessionId, createNewChat, loadChat]);

  const deleteChat = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      return filtered;
    });
  }, []);

  // Handle empty state after deletion
  useEffect(() => {
    if (sessions.length === 0) {
      createNewChat();
    } else if (currentSessionId && !sessions.find((s) => s.id === currentSessionId)) {
      loadChat(sessions[0].id);
    }
  }, [sessions, currentSessionId, createNewChat, loadChat]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !chatRef.current || !currentSessionId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    let isFirstMessage = false;

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          isFirstMessage = session.messages.length === 0;
          return {
            ...session,
            title: isFirstMessage
              ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
              : session.title,
            messages: [...session.messages, userMessage],
            updatedAt: Date.now(),
          };
        }
        return session;
      })
    );

    setIsLoading(true);
    setError(null);

    const modelMessageId = crypto.randomUUID();
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [
              ...session.messages,
              { id: modelMessageId, role: "model", content: "", timestamp: Date.now() },
            ],
          };
        }
        return session;
      })
    );

    try {
      const responseStream = await chatRef.current.sendMessageStream({
        message: content,
      });

      for await (const chunk of responseStream) {
        setSessions((prev) =>
          prev.map((session) => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                messages: session.messages.map((msg) =>
                  msg.id === modelMessageId
                    ? { ...msg, content: msg.content + (chunk.text || "") }
                    : msg
                ),
              };
            }
            return session;
          })
        );
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "An error occurred while sending the message.");
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: session.messages.filter((msg) => msg.id !== modelMessageId),
            };
          }
          return session;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return {
    sessions,
    currentSessionId,
    messages: currentSession?.messages || [],
    isLoading,
    error,
    sendMessage,
    createNewChat,
    loadChat,
    deleteChat,
    saveChat,
  };
}
