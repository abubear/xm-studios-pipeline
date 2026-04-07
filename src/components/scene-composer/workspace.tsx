"use client";

import { useEffect, useRef } from "react";
import { LeftPanel } from "./left-panel";
import { CentrePanel } from "./centre-panel";
import { RightPanel } from "./right-panel";
import { useSceneComposerStore } from "@/hooks/use-scene-composer-store";

interface WorkspaceProps {
  sessionId: string;
  characterName?: string;
}

export function SceneComposerWorkspace({
  sessionId,
  characterName,
}: WorkspaceProps) {
  const { setSearchQuery } = useSceneComposerStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (characterName && !initialized.current) {
      initialized.current = true;
      setSearchQuery(characterName);
    }
  }, [characterName, setSearchQuery]);

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden">
      <LeftPanel sessionCharacterName={characterName} />
      <CentrePanel />
      <RightPanel sessionId={sessionId} />
    </div>
  );
}
