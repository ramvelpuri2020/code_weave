"use client";

import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/analysis";

export interface HistoryItem {
  id: string;
  createdAt: string;
  code: string;
  result: AnalysisResult;
}

interface AnalysisHistoryProps {
  items: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
}

export function AnalysisHistory({
  items,
  onLoad,
  onClear,
}: AnalysisHistoryProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">History</h3>
        <p className="text-sm text-muted-foreground">
          Your analyses will appear here after you run them.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">History</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onLoad(item)}
            className="w-full rounded-lg border border-border bg-secondary/40 p-3 text-left transition-colors hover:bg-secondary"
          >
            <p className="line-clamp-2 text-sm text-foreground">
              {item.code.slice(0, 180)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
