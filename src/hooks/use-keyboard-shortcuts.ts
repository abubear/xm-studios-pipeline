import { useEffect } from "react";

interface KeyboardActions {
  onApprove: () => void;
  onReject: () => void;
  onNext: () => void;
  onPrev: () => void;
  onUndo: () => void;
  onEscape: () => void;
  onToggleHelp: () => void;
}

export function useKeyboardShortcuts(actions: KeyboardActions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't handle if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          actions.onApprove();
          break;
        case "r":
          e.preventDefault();
          actions.onReject();
          break;
        case " ":
          e.preventDefault();
          actions.onNext();
          break;
        case "arrowright":
        case "arrowdown":
          e.preventDefault();
          actions.onNext();
          break;
        case "arrowleft":
        case "arrowup":
          e.preventDefault();
          actions.onPrev();
          break;
        case "z":
          e.preventDefault();
          actions.onUndo();
          break;
        case "escape":
          e.preventDefault();
          actions.onEscape();
          break;
        case "?":
          e.preventDefault();
          actions.onToggleHelp();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actions]);
}
