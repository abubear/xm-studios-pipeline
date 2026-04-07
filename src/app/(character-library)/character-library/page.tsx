import { TopBar } from "@/components/layout/top-bar";
import { LibraryWorkspace } from "@/components/character-library/workspace";

export default function CharacterLibraryPage() {
  return (
    <div>
      <TopBar title="Character Library" />
      <LibraryWorkspace />
    </div>
  );
}
