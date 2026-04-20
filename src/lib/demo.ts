// ── Demo mode ────────────────────────────────────────────────────────────────
// When NEXT_PUBLIC_DEMO_MODE=true the app runs entirely offline:
// • auth middleware is bypassed
// • server pages use mock data from this file
// • API routes return mock JSON from this file
// ─────────────────────────────────────────────────────────────────────────────

import type { Profile, IPRoster, StyleGuideRule } from "@/types/database";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ── Identity ────────────────────────────────────────────────────────────────

export const DEMO_USER_ID = "demo-user-001";

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  email: "demo@xmstudios.sg",
  full_name: "Demo User",
  role: "admin",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-04-20T00:00:00Z",
};

// ── Sessions ────────────────────────────────────────────────────────────────

export const DEMO_SESSION_ID = "demo-session-001";

export const DEMO_SESSIONS = [
  {
    id: "demo-session-001",
    ip_roster_id: "demo-ip-001",
    name: "Iron Man Mark LXXXV — FW2027",
    stage: 3,
    status: "active",
    config: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-04-10T10:00:00Z",
    updated_at: "2026-04-20T14:30:00Z",
    ip_roster: {
      id: "demo-ip-001",
      name: "Iron Man",
      universe: "Marvel",
      thumbnail_url: "https://picsum.photos/seed/ironman/400/300",
      status: "licensed",
      description: "Iconic armoured Avenger from Marvel Comics.",
    },
  },
  {
    id: "demo-session-002",
    ip_roster_id: "demo-ip-002",
    name: "Spider-Man Classic — FW2027",
    stage: 5,
    status: "voting",
    config: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-04-05T09:00:00Z",
    updated_at: "2026-04-18T16:00:00Z",
    ip_roster: {
      id: "demo-ip-002",
      name: "Spider-Man",
      universe: "Marvel",
      thumbnail_url: "https://picsum.photos/seed/spiderman/400/300",
      status: "licensed",
      description: "Web-slinging hero of New York.",
    },
  },
  {
    id: "demo-session-003",
    ip_roster_id: "demo-ip-003",
    name: "Thor Ragnarok — FW2027",
    stage: 7,
    status: "active",
    config: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-03-28T11:00:00Z",
    updated_at: "2026-04-15T10:00:00Z",
    ip_roster: {
      id: "demo-ip-003",
      name: "Thor",
      universe: "Marvel",
      thumbnail_url: "https://picsum.photos/seed/thor/400/300",
      status: "licensed",
      description: "Asgardian God of Thunder.",
    },
  },
  {
    id: "demo-session-004",
    ip_roster_id: "demo-ip-004",
    name: "Batman Dark Knight — FW2027",
    stage: 10,
    status: "completed",
    config: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-02-14T08:00:00Z",
    updated_at: "2026-04-01T12:00:00Z",
    ip_roster: {
      id: "demo-ip-004",
      name: "Batman",
      universe: "DC",
      thumbnail_url: "https://picsum.photos/seed/batman/400/300",
      status: "licensed",
      description: "Caped Crusader of Gotham City.",
    },
  },
];

// ── Jury images ─────────────────────────────────────────────────────────────

export const DEMO_IMAGES = Array.from({ length: 16 }, (_, i) => ({
  id: `demo-img-${String(i + 1).padStart(3, "0")}`,
  session_id: DEMO_SESSION_ID,
  url: `https://picsum.photos/seed/${200 + i}/512/768`,
  prompt:
    "Iron Man Mark LXXXV premium collectible statue concept art, polystone figure, dramatic studio lighting",
  seed: 1000 + i,
  workflow_run_id: null,
  metadata: { aesthetic_score: +(Math.random() * 4 + 6).toFixed(1) },
  created_at: new Date(Date.now() - i * 3_600_000).toISOString(),
  approve_count: i < 6 ? 2 : i < 10 ? 1 : 0,
  reject_count: i >= 12 ? 1 : 0,
  my_vote:
    i < 4 ? "approve" : i >= 14 ? "reject" : null,
}));

// ── IP Roster ────────────────────────────────────────────────────────────────

export const DEMO_IP_ROSTER: IPRoster[] = [
  {
    id: "demo-ip-001",
    name: "Iron Man",
    universe: "Marvel",
    description: "Iconic armoured Avenger from Marvel Comics.",
    thumbnail_url: "https://picsum.photos/seed/ironman/400/300",
    logo_url: null,
    status: "licensed",
    metadata: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-04-20T10:00:00Z",
  },
  {
    id: "demo-ip-002",
    name: "Spider-Man",
    universe: "Marvel",
    description: "Web-slinging hero of New York.",
    thumbnail_url: "https://picsum.photos/seed/spiderman/400/300",
    logo_url: null,
    status: "licensed",
    metadata: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-04-18T10:00:00Z",
  },
  {
    id: "demo-ip-003",
    name: "Thor",
    universe: "Marvel",
    description: "Asgardian God of Thunder.",
    thumbnail_url: "https://picsum.photos/seed/thor/400/300",
    logo_url: null,
    status: "licensed",
    metadata: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-04-15T10:00:00Z",
  },
  {
    id: "demo-ip-004",
    name: "Batman",
    universe: "DC",
    description: "Caped Crusader of Gotham City.",
    thumbnail_url: "https://picsum.photos/seed/batman/400/300",
    logo_url: null,
    status: "licensed",
    metadata: {},
    created_by: DEMO_USER_ID,
    created_at: "2026-02-10T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  },
];

// ── Style guide rules ────────────────────────────────────────────────────────

export const DEMO_STYLE_RULES: StyleGuideRule[] = [
  {
    id: "demo-rule-001",
    ip_roster_id: null,
    universe: "Marvel",
    category: "Lighting",
    rule: "Always use dramatic, volumetric studio lighting for hero shots.",
    severity: "high",
    is_active: true,
    created_by: DEMO_USER_ID,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "demo-rule-002",
    ip_roster_id: null,
    universe: "Marvel",
    category: "Texture",
    rule: "Polystone surfaces must show micro-scratch and paint chip detail.",
    severity: "medium",
    is_active: true,
    created_by: DEMO_USER_ID,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "demo-rule-003",
    ip_roster_id: null,
    universe: null,
    category: "Pose",
    rule: "Dynamic, action poses preferred over static standing poses.",
    severity: "low",
    is_active: true,
    created_by: DEMO_USER_ID,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

// ── Admin stats ──────────────────────────────────────────────────────────────

export const DEMO_STATS = {
  totalSessions: DEMO_SESSIONS.length,
  activeSessions: DEMO_SESSIONS.filter((s) => s.status === "active").length,
  totalGeneratedImages: 1_247,
  totalVotes: 3_891,
  totalFinalists: 64,
  publishedPackages: 2,
};

// ── 3D Models (Character Library) ───────────────────────────────────────────

export const DEMO_MODELS = Array.from({ length: 12 }, (_, i) => {
  const chars = ["Iron Man", "Spider-Man", "Thor", "Batman", "Wonder Woman", "Captain America", "Black Panther", "Hulk", "Wolverine", "Deadpool", "Doctor Strange", "Vision"];
  const universes = ["Marvel", "Marvel", "Marvel", "DC", "DC", "Marvel", "Marvel", "Marvel", "Marvel", "Marvel", "Marvel", "Marvel"];
  return {
    id: `demo-model-${String(i + 1).padStart(3, "0")}`,
    name: `${chars[i]} Classic Pose`,
    character_name: chars[i],
    universe: universes[i],
    thumbnail_url: `https://picsum.photos/seed/model${i + 300}/400/400`,
    sketchfab_uid: null,
    poly_count: Math.floor(Math.random() * 200_000 + 50_000),
    file_format: "OBJ",
    tags: ["collectible", "premium", "1:4 scale"],
    metadata: {},
    created_by: DEMO_USER_ID,
    created_at: new Date(Date.now() - i * 86_400_000 * 7).toISOString(),
    updated_at: new Date(Date.now() - i * 86_400_000 * 3).toISOString(),
  };
});
