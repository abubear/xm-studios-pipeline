"use client";

import { InputPanel } from "./input-panel";
import { ResultsPanel } from "./results-panel";

export function ImaginationWorkspace() {
  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden">
      <InputPanel />
      <ResultsPanel />
    </div>
  );
}
