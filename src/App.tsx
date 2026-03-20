import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { useChat } from "@/hooks/useChat";
import { Bot, AlertCircle, Plus, MessageSquare, Trash2, Menu, X, Save, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function App() {
  const {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    createNewChat,
    loadChat,
    deleteChat,
    saveChat
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    saveChat();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen w-full bg-white font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r bg-slate-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2 font-semibold text-indigo-900">
            <Bot className="h-5 w-5" />
            <span>AI Mentor</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-200 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              createNewChat();
              setIsSidebarOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pt-0">
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  currentSessionId === session.id
                    ? "bg-indigo-100 text-indigo-900"
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                )}
                onClick={() => {
                  loadChat(session.id);
                  setIsSidebarOpen(false);
                }}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(session.id);
                  }}
                  className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-slate-300 hover:text-red-600 group-hover:opacity-100"
                  title="Delete chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight md:hidden">AI Mentor</h1>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold tracking-tight">
                {sessions.find((s) => s.id === currentSessionId)?.title || "New Chat"}
              </h1>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isSaved 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Chat
              </>
            )}
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                How can I help you today?
              </h2>
              <p className="max-w-md text-slate-500">
                I'm your personal AI mentor. I can help you with coding, project
                ideas, debugging, and career guidance.
              </p>
              <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  "Explain how React hooks work",
                  "Help me debug a Python script",
                  "Suggest a unique AI project idea",
                  "How do I prepare for a DSA interview?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-xl border bg-white p-4 text-left text-sm text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-900"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex w-full gap-4 bg-slate-50 p-4 md:p-6">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-sm">
                    <Bot className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                  </div>
                </div>
              )}
              {error && (
                <div className="mx-auto mt-4 flex w-full max-w-3xl items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 bg-white">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </main>
    </div>
  );
}
