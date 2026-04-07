import type { GeneratedImage } from "./database";

export interface JuryImage extends GeneratedImage {
  approve_count: number;
  reject_count: number;
  my_vote: "approve" | "reject" | null;
}

export interface VotePayload {
  generated_image_id: string;
  vote: "approve" | "reject";
}

export interface TeamMember {
  id: string;
  full_name: string;
  avatar_url: string | null;
  vote_count: number;
  total_images: number;
}

export interface ActivityEvent {
  id: string;
  user_name: string;
  user_avatar: string | null;
  image_id: string;
  vote: "approve" | "reject";
  timestamp: string;
}

export type JuryFilter = "all" | "unvoted" | "approved" | "rejected";
export type JurySort = "vote_score" | "ai_score" | "id";
export type GridDensity = "3" | "4" | "5";
export type JuryRound = 1 | 2 | 3;
