"use client";

import { useState } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CodeEditor({ value, onChange, placeholder }: CodeEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const lines = value.split("\n");
  const lineNumbers = lines.length > 0 ? lines.length : 1;

  return (
    <div
      className={`relative rounded-lg border bg-[#0a0a0a] transition-all ${
        isFocused ? "border-accent ring-1 ring-accent/20" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-sm text-muted-foreground">code.tsx</span>
      </div>

      <div className="flex">
        <div className="select-none flex flex-col items-end border-r border-border bg-[#0a0a0a] px-3 py-4 font-mono text-sm text-muted-foreground">
          {Array.from({ length: Math.max(lineNumbers, 15) }, (_, i) => (
            <div key={i + 1} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          spellCheck={false}
          className="min-h-[360px] flex-1 resize-none bg-transparent px-4 py-4 font-mono text-sm leading-6 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>
    </div>
  );
}
