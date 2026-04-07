import { TopBar } from "@/components/layout/top-bar";
import { ImaginationWorkspace } from "@/components/imagination-studio/workspace";

export default function ImaginationStudioPage() {
  return (
    <div>
      <TopBar title="Imagination Studio" />
      <ImaginationWorkspace />
    </div>
  );
}
