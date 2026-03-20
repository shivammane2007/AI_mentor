import { SendHorizontal } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-4 pt-2 md:px-6">
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full items-end gap-2 rounded-xl border bg-white p-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-500"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-3 py-3 text-sm focus:outline-none"
          rows={1}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          <SendHorizontal className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </button>
      </form>
      <div className="mt-2 text-center text-xs text-slate-500">
        AI Mentor can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
}
