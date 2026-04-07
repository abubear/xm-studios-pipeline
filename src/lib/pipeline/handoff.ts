/**
 * Pipeline stage handoff utilities.
 * Manages resources flowing between stages and stage advancement.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { ResourceType, PipelineResource, StageTransition } from "@/types/database";

/** Storage path convention: sessions/{sessionId}/stage-{XX}/{resourceType}/{filename} */
export function storagePath(
  sessionId: string,
  stage: number,
  resourceType: string,
  filename: string
): string {
  const stageStr = String(stage).padStart(2, "0");
  return `sessions/${sessionId}/stage-${stageStr}/${resourceType}/${filename}`;
}

/** Get all resources produced by a specific stage for a session. */
export async function getStageOutputs(
  sessionId: string,
  stage: number
): Promise<PipelineResource[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pipeline_resources")
    .select("*")
    .eq("session_id", sessionId)
    .eq("stage_produced", stage)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get stage outputs: ${error.message}`);
  return data ?? [];
}

/** Get inputs available for a stage (outputs from previous stages that feed into it). */
export async function getStageInputs(
  sessionId: string,
  stage: number
): Promise<PipelineResource[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pipeline_resources")
    .select("*")
    .eq("session_id", sessionId)
    .eq("stage_consumed_by", stage)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get stage inputs: ${error.message}`);
  return data ?? [];
}

/** Save a resource produced by a stage. */
export async function saveStageOutput(params: {
  sessionId: string;
  stageProduced: number;
  stageConsumedBy?: number;
  resourceType: ResourceType;
  fileUrl: string;
  filename: string;
  metadata?: Record<string, unknown>;
}): Promise<PipelineResource> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pipeline_resources")
    .insert({
      session_id: params.sessionId,
      stage_produced: params.stageProduced,
      stage_consumed_by: params.stageConsumedBy ?? null,
      resource_type: params.resourceType,
      file_url: params.fileUrl,
      filename: params.filename,
      metadata_json: params.metadata ?? {},
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save stage output: ${error.message}`);
  return data;
}

/** Advance a session to the next stage, recording the transition. */
export async function advanceStage(params: {
  sessionId: string;
  fromStage: number;
  toStage: number;
  resourceIds?: string[];
  userId?: string;
}): Promise<StageTransition> {
  const supabase = createAdminClient();

  // Record the transition
  const { data: transition, error: transError } = await supabase
    .from("stage_transitions")
    .insert({
      session_id: params.sessionId,
      from_stage: params.fromStage,
      to_stage: params.toStage,
      resource_ids: params.resourceIds ?? [],
      transitioned_by: params.userId ?? null,
    })
    .select()
    .single();

  if (transError) throw new Error(`Failed to record transition: ${transError.message}`);

  // Update the session's current stage
  const { error: updateError } = await supabase
    .from("sessions")
    .update({ stage: params.toStage })
    .eq("id", params.sessionId);

  if (updateError) throw new Error(`Failed to update session stage: ${updateError.message}`);

  return transition;
}

/** Get transition history for a session. */
export async function getTransitionHistory(
  sessionId: string
): Promise<StageTransition[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stage_transitions")
    .select("*")
    .eq("session_id", sessionId)
    .order("transitioned_at", { ascending: true });

  if (error) throw new Error(`Failed to get transition history: ${error.message}`);
  return data ?? [];
}

/** Pipeline stage definitions. */
export const PIPELINE_STAGES = [
  { stage: 1, label: "Research & References", key: "research" },
  { stage: 2, label: "Style Guide Check", key: "style-check" },
  { stage: 3, label: "Mass Generation", key: "generation" },
  { stage: 4, label: "Auto Pre-Filter", key: "filter" },
  { stage: 5, label: "Team Voting", key: "voting" },
  { stage: 6, label: "Finalist Selection", key: "finalists" },
  { stage: 7, label: "IP Gate 1", key: "ip-gate-1" },
  { stage: 8, label: "Turnaround Sheets", key: "turnaround" },
  { stage: 9, label: "3D Generation", key: "3d-gen" },
  { stage: 10, label: "Auto-Rigging", key: "rigging" },
  { stage: 11, label: "IP Gate 2", key: "ip-gate-2" },
  { stage: 12, label: "Production Review", key: "production" },
  { stage: 13, label: "Factory Package", key: "factory" },
] as const;
