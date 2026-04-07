// ============================================================
// XM Studios — Database Types (matches Supabase schema exactly)
// ============================================================

export type UserRole =
  | "admin"
  | "creative_director"
  | "sculptor"
  | "reviewer"
  | "licensing"
  | "factory_coordinator";

export type SessionStatus =
  | "draft"
  | "active"
  | "voting"
  | "completed"
  | "archived";

export type VoteValue = "approve" | "reject";

export type ContentType =
  | "turntable_video"
  | "hero_shot"
  | "detail_closeup"
  | "animated_gif"
  | "preorder_poster"
  | "content_package";

export type PackageStatus =
  | "pending"
  | "generating"
  | "review"
  | "approved"
  | "published";

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

// ============================================================
// TABLE TYPES
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface IPRoster {
  id: string;
  name: string;
  universe: string;
  description: string | null;
  thumbnail_url: string | null;
  logo_url: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  ip_roster_id: string;
  name: string;
  stage: number;
  status: SessionStatus;
  config: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferenceImage {
  id: string;
  session_id: string;
  url: string;
  source: string;
  source_id: string | null;
  caption: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface GeneratedImage {
  id: string;
  session_id: string;
  url: string;
  thumbnail_url: string | null;
  prompt: string | null;
  negative_prompt: string | null;
  workflow: string;
  seed: number | null;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Vote {
  id: string;
  generated_image_id: string;
  user_id: string;
  vote: VoteValue;
  notes: string | null;
  created_at: string;
}

export interface Finalist {
  id: string;
  session_id: string;
  generated_image_id: string;
  rank: number;
  notes: string | null;
  selected_by: string | null;
  created_at: string;
}

export interface IPSubmission {
  id: string;
  session_id: string;
  ip_roster_id: string;
  gate_number: number;
  status: SubmissionStatus;
  submission_data: Record<string, unknown>;
  feedback: string | null;
  submitted_by: string | null;
  reviewed_by: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface Model3D {
  id: string;
  name: string;
  session_id: string | null;
  file_url: string;
  thumbnail_url: string | null;
  format: string;
  file_size_bytes: number | null;
  vertex_count: number | null;
  is_rigged: boolean;
  metadata: Record<string, unknown>;
  uploaded_by: string | null;
  created_at: string;
}

export interface CharacterLibraryEntry {
  id: string;
  name: string;
  ip_roster_id: string | null;
  model_id: string | null;
  thumbnail_url: string | null;
  description: string | null;
  tags: string[];
  embedding: number[] | null;
  sketchfab_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StyleGuideRule {
  id: string;
  ip_roster_id: string | null;
  universe: string | null;
  rule: string;
  category: string;
  severity: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FactoryPackage {
  id: string;
  session_id: string;
  ip_roster_id: string;
  name: string;
  status: PackageStatus;
  package_url: string | null;
  contents: Record<string, unknown>;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreContent {
  id: string;
  ip_roster_id: string;
  content_type: ContentType;
  title: string | null;
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

// ============================================================
// PIPELINE TYPES
// ============================================================

export type ResourceType =
  | "reference_image"
  | "generated_image"
  | "filtered_image"
  | "finalist_image"
  | "submission_pack"
  | "turnaround_sheet"
  | "model_3d"
  | "rigged_model"
  | "texture_map"
  | "paint_guide"
  | "factory_package"
  | "store_content";

export interface PipelineResource {
  id: string;
  session_id: string;
  stage_produced: number;
  stage_consumed_by: number | null;
  resource_type: ResourceType;
  file_url: string;
  filename: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface StageTransition {
  id: string;
  session_id: string;
  from_stage: number;
  to_stage: number;
  resource_ids: string[];
  transitioned_at: string;
  transitioned_by: string | null;
}

export interface StoreContentPackage {
  id: string;
  ip_roster_id: string;
  name: string;
  status: PackageStatus;
  contents: string[];
  description: string | null;
  published_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// SUPABASE DATABASE TYPE MAP (for typed client)
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      ip_roster: {
        Row: IPRoster;
        Insert: Omit<IPRoster, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<IPRoster, "id" | "created_at" | "updated_at">>;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Session, "id" | "created_at" | "updated_at">>;
      };
      reference_images: {
        Row: ReferenceImage;
        Insert: Omit<ReferenceImage, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<ReferenceImage, "id" | "created_at">>;
      };
      generated_images: {
        Row: GeneratedImage;
        Insert: Omit<GeneratedImage, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<GeneratedImage, "id" | "created_at">>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Vote, "id" | "created_at">>;
      };
      finalists: {
        Row: Finalist;
        Insert: Omit<Finalist, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Finalist, "id" | "created_at">>;
      };
      ip_submissions: {
        Row: IPSubmission;
        Insert: Omit<IPSubmission, "id" | "submitted_at"> & { id?: string };
        Update: Partial<Omit<IPSubmission, "id" | "submitted_at">>;
      };
      models_3d: {
        Row: Model3D;
        Insert: Omit<Model3D, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Model3D, "id" | "created_at">>;
      };
      character_library: {
        Row: CharacterLibraryEntry;
        Insert: Omit<CharacterLibraryEntry, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<CharacterLibraryEntry, "id" | "created_at" | "updated_at">>;
      };
      style_guide_rules: {
        Row: StyleGuideRule;
        Insert: Omit<StyleGuideRule, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<StyleGuideRule, "id" | "created_at" | "updated_at">>;
      };
      factory_packages: {
        Row: FactoryPackage;
        Insert: Omit<FactoryPackage, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<FactoryPackage, "id" | "created_at" | "updated_at">>;
      };
      store_content: {
        Row: StoreContent;
        Insert: Omit<StoreContent, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<StoreContent, "id" | "created_at">>;
      };
      store_content_packages: {
        Row: StoreContentPackage;
        Insert: Omit<StoreContentPackage, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<StoreContentPackage, "id" | "created_at" | "updated_at">>;
      };
      pipeline_resources: {
        Row: PipelineResource;
        Insert: Omit<PipelineResource, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<PipelineResource, "id" | "created_at">>;
      };
      stage_transitions: {
        Row: StageTransition;
        Insert: Omit<StageTransition, "id" | "transitioned_at"> & { id?: string };
        Update: Partial<Omit<StageTransition, "id" | "transitioned_at">>;
      };
    };
    Enums: {
      user_role: UserRole;
      session_status: SessionStatus;
      vote_value: VoteValue;
      content_type: ContentType;
      package_status: PackageStatus;
      submission_status: SubmissionStatus;
      resource_type: ResourceType;
    };
  };
}
