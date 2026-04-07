export interface PipelineStage {
  id: number;
  name: string;
  shortName: string;
  description: string;
  app: string | null;
  href: (sessionId: string) => string | null;
  gate?: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 0,
    name: "IP Selection & Brief",
    shortName: "Brief",
    description: "Select character IP, define pose concept, and set production brief",
    app: null,
    href: () => null,
  },
  {
    id: 1,
    name: "Reference Gathering",
    shortName: "References",
    description: "Gather comic panels, concept art, and reference images from ComicVine",
    app: "Scene Composer",
    href: (sid) => `/scene-composer?session=${sid}`,
  },
  {
    id: 2,
    name: "Style Guide Check",
    shortName: "Style Guide",
    description: "Claude AI validates references against licensor style guide rules",
    app: null,
    href: () => null,
  },
  {
    id: 3,
    name: "Mass Generation",
    shortName: "Generation",
    description: "Generate 1,000+ concept images via QWen ModelSheet workflow",
    app: "Imagination Studio",
    href: (sid) => `/imagination-studio?session=${sid}`,
  },
  {
    id: 4,
    name: "IP Gate 1 — Concept Approval",
    shortName: "Gate 1",
    description: "Submit top concepts to IP holder for approval",
    app: null,
    href: () => null,
    gate: 1,
  },
  {
    id: 5,
    name: "Team Voting",
    shortName: "Voting",
    description: "Jury reviews generated images — 1,000 images down to 20 finalists",
    app: "Jury",
    href: (sid) => `/jury?session=${sid}`,
  },
  {
    id: 6,
    name: "Finalist Selection",
    shortName: "Finalists",
    description: "Creative director selects final concepts from jury results",
    app: "Jury",
    href: (sid) => `/jury?session=${sid}&view=finalists`,
  },
  {
    id: 7,
    name: "IP Gate 2 — Design Approval",
    shortName: "Gate 2",
    description: "Submit finalists with Sketchfab 3D previews to IP holder",
    app: null,
    href: () => null,
    gate: 2,
  },
  {
    id: 8,
    name: "Multi-Angle Turnarounds",
    shortName: "Turnarounds",
    description: "Generate advanced multi-angle views via QWen ModelSheet Advanced",
    app: "Imagination Studio",
    href: (sid) => `/imagination-studio?session=${sid}&mode=turnaround`,
  },
  {
    id: 9,
    name: "3D Model Generation",
    shortName: "3D Gen",
    description: "Generate 3D mesh from approved concepts via Trellis 2",
    app: "Character Library",
    href: (sid) => `/character-library?session=${sid}`,
  },
  {
    id: 10,
    name: "Auto-Rigging",
    shortName: "Rigging",
    description: "Automatic skeleton rigging via UniRig for pose adjustments",
    app: "Character Library",
    href: (sid) => `/character-library?session=${sid}&view=rigging`,
  },
  {
    id: 11,
    name: "Sculpt Refinement",
    shortName: "Sculpting",
    description: "Manual sculpt refinement by artists using 3D tools",
    app: null,
    href: () => null,
  },
  {
    id: 12,
    name: "Store Content Generation",
    shortName: "Content",
    description: "Generate turntable videos, hero shots, GIFs, and marketing materials",
    app: "Store Content",
    href: (sid) => `/store-content?session=${sid}`,
  },
  {
    id: 13,
    name: "Factory Package & Handoff",
    shortName: "Handoff",
    description: "Package final assets for factory production and manufacturing",
    app: null,
    href: () => null,
  },
];

export function getStageName(stage: number): string {
  return PIPELINE_STAGES[stage]?.name ?? `Stage ${stage}`;
}

export function getStageShortName(stage: number): string {
  return PIPELINE_STAGES[stage]?.shortName ?? `S${stage}`;
}
