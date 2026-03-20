import { cn } from "@/lib/utils";
import { Bot, User, Check, Copy } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "model";
  content: string;
  timestamp?: number;
}

function CodeBlock({ language, value, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-slate-800 p-1.5 text-slate-300 opacity-0 transition-opacity hover:bg-slate-700 hover:text-white group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 z-10"
        aria-label="Copy code"
        title="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
      <div tabIndex={0} className="rounded-md overflow-auto focus:outline-none focus:ring-2 focus:ring-slate-400">
        <SyntaxHighlighter
          {...props}
          style={oneDark}
          language={language}
          PreTag="div"
          className="!my-0"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  const formattedTime = timestamp 
    ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(timestamp))
    : null;

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 md:p-6",
        isUser ? "bg-white flex-row-reverse" : "bg-slate-50"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-indigo-600" />}
      </div>
      <div className={cn("flex-1 space-y-2 overflow-hidden px-1", isUser ? "flex flex-col items-end" : "")}>
        <div className={cn("prose prose-slate max-w-none break-words prose-p:leading-relaxed prose-pre:p-0", isUser ? "text-right" : "")}>
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children, ...props }: any) => (
                <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 m-0" {...props}>
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children, ...props }: any) => (
                <thead className="bg-slate-50" {...props}>
                  {children}
                </thead>
              ),
              tbody: ({ children, ...props }: any) => (
                <tbody className="divide-y divide-slate-200 bg-white" {...props}>
                  {children}
                </tbody>
              ),
              tr: ({ children, ...props }: any) => (
                <tr className="hover:bg-slate-50 transition-colors" {...props}>
                  {children}
                </tr>
              ),
              th: ({ children, ...props }: any) => (
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900" {...props}>
                  {children}
                </th>
              ),
              td: ({ children, ...props }: any) => (
                <td className="whitespace-normal px-4 py-3 text-sm text-slate-600 border-t border-slate-200" {...props}>
                  {children}
                </td>
              ),
              ul: ({ children, className, ...props }: any) => (
                <ul className={cn(className?.includes("contains-task-list") ? "list-none pl-0" : "")} {...props}>
                  {children}
                </ul>
              ),
              li: ({ children, className, ...props }: any) => (
                <li className={cn(className?.includes("task-list-item") ? "flex items-start gap-2 my-1" : "")} {...props}>
                  {children}
                </li>
              ),
              input: ({ type, checked, disabled, ...props }: any) => {
                if (type === "checkbox") {
                  return (
                    <input
                      type="checkbox"
                      className="mt-1.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                      checked={checked}
                      disabled={disabled}
                      {...props}
                    />
                  );
                }
                return <input type={type} checked={checked} disabled={disabled} {...props} />;
              },
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <CodeBlock
                    {...props}
                    language={match[1]}
                    value={String(children).replace(/\n$/, "")}
                  />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </Markdown>
        </div>
        {formattedTime && (
          <div className={cn("text-[11px] text-slate-400 mt-1 select-none", isUser ? "text-right" : "text-left")}>
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
}
