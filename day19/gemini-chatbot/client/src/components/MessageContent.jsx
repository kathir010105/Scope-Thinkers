import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Unable to copy code:", error);
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-slate-700 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-slate-700 bg-[#161b22] px-4 py-2.5">
        <span className="text-xs font-medium text-slate-300">
          {language || "code"}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <pre className="!m-0 !rounded-none !bg-transparent !p-4 text-[13px] leading-6">
          <code className="font-mono">{children}</code>
        </pre>
      </div>
    </div>
  );
}

export default function MessageContent({ content = "" }) {
  return (
    <div className="markdown-content min-w-0 break-words text-sm leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true }]]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-7 text-2xl font-extrabold tracking-tight text-slate-900 first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 text-xl font-bold tracking-tight text-slate-900 first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-bold text-slate-900">
              {children}
            </h3>
          ),

          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,

          strong: ({ children }) => (
            <strong className="font-bold text-slate-950">{children}</strong>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1.5">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1.5">{children}</ol>
          ),

          li: ({ children }) => <li className="pl-1">{children}</li>,

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-blue-400 pl-4 italic text-slate-600">
              {children}
            </blockquote>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
            >
              {children}
            </a>
          ),

          hr: () => <hr className="my-6 border-slate-200" />,

          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-slate-100 text-slate-800">{children}</thead>
          ),

          th: ({ children }) => (
            <th className="border-b border-slate-200 px-4 py-3 font-bold">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-3 align-top">
              {children}
            </td>
          ),

          code: ({ className, children, ...props }) => {
            const match = /language-([\w-]+)/.exec(className || "");

            if (match) {
              return <CodeBlock language={match[1]}>{children}</CodeBlock>;
            }

            return (
              <code
                {...props}
                className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-rose-700"
              >
                {children}
              </code>
            );
          },

          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
