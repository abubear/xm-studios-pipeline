// ============================================================
// ViewComfy Workflow Wrappers — typed functions for each pipeline step
// ============================================================

import {
  runWorkflowWithProgress,
  type ProgressCallback,
  type WorkflowResult,
  type WorkflowFileInput,
} from "./client";

// ── Shared types ──

export interface WorkflowOptions {
  onProgress?: ProgressCallback;
}

// ── 1. Qwen Mass Generation ──
// Reference image + style settings → ~1,000 concept variations

export interface QwenMassGenerationParams {
  referenceImage: Blob | Buffer;
  referenceFilename?: string;
  prompt: string;
  negativePrompt?: string;
  batchSize?: number; // default 1000
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
}

export interface QwenMassGenerationResult extends WorkflowResult {
  imageUrls: string[];
  totalGenerated: number;
}

export async function qwenMassGeneration(
  params: QwenMassGenerationParams,
  options?: WorkflowOptions
): Promise<QwenMassGenerationResult> {
  const files: WorkflowFileInput[] = [
    {
      key: "1-inputs-image",
      file: params.referenceImage,
      filename: params.referenceFilename || "reference.png",
    },
  ];

  const result = await runWorkflowWithProgress(
    {
      workflow: "qwen-mass-generation",
      params: [
        { key: "2-inputs-text", value: params.prompt },
        {
          key: "2-inputs-negative",
          value: params.negativePrompt || "",
        },
        {
          key: "3-inputs-batch_size",
          value: params.batchSize ?? 1000,
        },
        { key: "3-inputs-width", value: params.width ?? 768 },
        { key: "3-inputs-height", value: params.height ?? 1024 },
        { key: "3-inputs-steps", value: params.steps ?? 30 },
        {
          key: "3-inputs-cfg_scale",
          value: params.cfgScale ?? 7.5,
        },
        {
          key: "3-inputs-seed",
          value: params.seed ?? Math.floor(Math.random() * 999999),
        },
      ],
      files,
    },
    options?.onProgress || (() => {})
  );

  return {
    ...result,
    imageUrls: result.outputUrls,
    totalGenerated: result.outputUrls.length,
  };
}

// ── 2. Qwen Multi-Angle ──
// Approved concept image → front/side/back/quarter views

export interface QwenMultiAngleParams {
  conceptImage: Blob | Buffer;
  conceptFilename?: string;
  prompt?: string;
  angles?: string[]; // default: front, side, back, quarter
  width?: number;
  height?: number;
}

export interface MultiAngleResult extends WorkflowResult {
  views: { angle: string; url: string }[];
}

export async function qwenMultiAngle(
  params: QwenMultiAngleParams,
  options?: WorkflowOptions
): Promise<MultiAngleResult> {
  const angles = params.angles || ["front", "side", "back", "quarter"];

  const files: WorkflowFileInput[] = [
    {
      key: "1-inputs-image",
      file: params.conceptImage,
      filename: params.conceptFilename || "concept.png",
    },
  ];

  const result = await runWorkflowWithProgress(
    {
      workflow: "qwen-multi-angle",
      params: [
        {
          key: "2-inputs-text",
          value:
            params.prompt ||
            "Generate multi-angle views of this character statue",
        },
        { key: "3-inputs-angles", value: angles.join(",") },
        { key: "3-inputs-width", value: params.width ?? 1024 },
        { key: "3-inputs-height", value: params.height ?? 1024 },
      ],
      files,
    },
    options?.onProgress || (() => {})
  );

  // Map outputs to angle labels
  const views = result.outputUrls.map((url, i) => ({
    angle: angles[i] || `view-${i}`,
    url,
  }));

  return {
    ...result,
    views,
  };
}

// ── 3. Trellis 2 Generate ──
// Front + top PNGs → GLB 3D model

export interface Trellis2GenerateParams {
  frontImage: Blob | Buffer;
  frontFilename?: string;
  topImage: Blob | Buffer;
  topFilename?: string;
  format?: "glb" | "obj" | "fbx"; // default glb
  resolution?: number; // mesh resolution
}

export interface Trellis2Result extends WorkflowResult {
  modelUrl: string;
  format: string;
}

export async function trellis2Generate(
  params: Trellis2GenerateParams,
  options?: WorkflowOptions
): Promise<Trellis2Result> {
  const files: WorkflowFileInput[] = [
    {
      key: "1-inputs-front_image",
      file: params.frontImage,
      filename: params.frontFilename || "front.png",
    },
    {
      key: "2-inputs-top_image",
      file: params.topImage,
      filename: params.topFilename || "top.png",
    },
  ];

  const format = params.format ?? "glb";

  const result = await runWorkflowWithProgress(
    {
      workflow: "trellis2-generate",
      params: [
        { key: "3-inputs-format", value: format },
        {
          key: "3-inputs-resolution",
          value: params.resolution ?? 512,
        },
      ],
      files,
    },
    options?.onProgress || (() => {})
  );

  return {
    ...result,
    modelUrl: result.outputUrls[0] || "",
    format,
  };
}

// ── 4. UniRig Auto-Rig ──
// GLB → rigged FBX with skeleton

export interface UniRigAutoRigParams {
  modelFile: Blob | Buffer;
  modelFilename?: string;
  skeletonType?: "humanoid" | "quadruped" | "custom";
  outputFormat?: "fbx" | "glb";
}

export interface UniRigResult extends WorkflowResult {
  riggedModelUrl: string;
  skeletonType: string;
  boneCount?: number;
}

export async function uniRigAutoRig(
  params: UniRigAutoRigParams,
  options?: WorkflowOptions
): Promise<UniRigResult> {
  const files: WorkflowFileInput[] = [
    {
      key: "1-inputs-model",
      file: params.modelFile,
      filename: params.modelFilename || "model.glb",
    },
  ];

  const result = await runWorkflowWithProgress(
    {
      workflow: "unirig-auto-rig",
      params: [
        {
          key: "2-inputs-skeleton_type",
          value: params.skeletonType ?? "humanoid",
        },
        {
          key: "2-inputs-output_format",
          value: params.outputFormat ?? "fbx",
        },
      ],
      files,
    },
    options?.onProgress || (() => {})
  );

  return {
    ...result,
    riggedModelUrl: result.outputUrls[0] || "",
    skeletonType: params.skeletonType ?? "humanoid",
    boneCount: (result.metadata?.bone_count as number) || undefined,
  };
}

// ── 5. SV3D Turntable ──
// Hero image → 360° rotating video

export interface SV3DTurntableParams {
  heroImage: Blob | Buffer;
  heroFilename?: string;
  frameCount?: number; // 12-36, default 24
  cameraElevation?: number; // degrees, -15 to 45
  outputFormat?: "mp4" | "gif" | "webm";
  background?: "transparent" | "white" | "studio";
  width?: number;
  height?: number;
}

export interface SV3DTurntableResult extends WorkflowResult {
  videoUrl: string;
  frameCount: number;
  format: string;
}

export async function sv3dTurntable(
  params: SV3DTurntableParams,
  options?: WorkflowOptions
): Promise<SV3DTurntableResult> {
  const files: WorkflowFileInput[] = [
    {
      key: "1-inputs-image",
      file: params.heroImage,
      filename: params.heroFilename || "hero.png",
    },
  ];

  const frameCount = params.frameCount ?? 24;
  const format = params.outputFormat ?? "mp4";

  const result = await runWorkflowWithProgress(
    {
      workflow: "sv3d-turntable",
      params: [
        { key: "2-inputs-frame_count", value: frameCount },
        {
          key: "2-inputs-elevation",
          value: params.cameraElevation ?? 15,
        },
        { key: "2-inputs-output_format", value: format },
        {
          key: "2-inputs-background",
          value: params.background ?? "studio",
        },
        { key: "2-inputs-width", value: params.width ?? 1024 },
        { key: "2-inputs-height", value: params.height ?? 1024 },
      ],
      files,
    },
    options?.onProgress || (() => {})
  );

  return {
    ...result,
    videoUrl: result.outputUrls[0] || "",
    frameCount,
    format,
  };
}

// ── 6. Multi-Angle Renders ──
// GLB model → renders from 8-12 camera angles

export type CameraAngleName =
  | "front"
  | "front-quarter"
  | "side"
  | "back-quarter"
  | "back"
  | "top-down"
  | "low-angle"
  | "face-detail";

export interface MultiAngleRendersParams {
  modelFile: Blob | Buffer;
  modelFilename?: string;
  angles?: CameraAngleName[];
  lighting?: "studio" | "dramatic" | "natural";
  resolution?: 1024 | 2048 | 4096;
  background?: "transparent" | "white" | "studio";
}

export interface MultiAngleRendersResult extends WorkflowResult {
  renders: { angle: CameraAngleName; url: string }[];
}

const DEFAULT_ANGLES: CameraAngleName[] = [
  "front",
  "front-quarter",
  "side",
  "back-quarter",
  "back",
  "top-down",
  "low-angle",
  "face-detail",
];

export async function multiAngleRenders(
  params: MultiAngleRendersParams,
  options?: WorkflowOptions
): Promise<MultiAngleRendersResult> {
  const files: WorkflowFileInput[] = [
    {
      key: "1-inputs-model",
      file: params.modelFile,
      filename: params.modelFilename || "model.glb",
    },
  ];

  const angles = params.angles ?? DEFAULT_ANGLES;

  const result = await runWorkflowWithProgress(
    {
      workflow: "multi-angle-renders",
      params: [
        { key: "2-inputs-angles", value: angles.join(",") },
        {
          key: "2-inputs-lighting",
          value: params.lighting ?? "studio",
        },
        {
          key: "2-inputs-resolution",
          value: params.resolution ?? 2048,
        },
        {
          key: "2-inputs-background",
          value: params.background ?? "studio",
        },
      ],
      files,
    },
    options?.onProgress || (() => {})
  );

  const renders = result.outputUrls.map((url, i) => ({
    angle: angles[i] || (`angle-${i}` as CameraAngleName),
    url,
  }));

  return {
    ...result,
    renders,
  };
}

// ── 7. Generate Scene GIF ──
// Hero image + prompt → animated scene video (Wan2.1)

export interface GenerateSceneGifParams {
  heroImage: Blob | Buffer;
  heroFilename?: string;
  sceneDescription: string;
  style?: "subtle" | "moderate" | "cinematic";
  duration?: 2 | 3 | 5; // seconds
  width?: number;
  height?: number;
  outputFormat?: "gif" | "mp4" | "webm";
}

export interface SceneGifResult extends WorkflowResult {
  videoUrl: string;
  gifUrl?: string;
  duration: number;
  format: string;
}

export async function generateSceneGif(
  params: GenerateSceneGifParams,
  options?: WorkflowOptions
): Promise<SceneGifResult> {
  const files: WorkflowFileInput[] = [
    {
      key: "1-inputs-image",
      file: params.heroImage,
      filename: params.heroFilename || "hero.png",
    },
  ];

  const duration = params.duration ?? 3;
  const format = params.outputFormat ?? "mp4";

  // Map style to motion intensity
  const motionIntensity: Record<string, number> = {
    subtle: 3,
    moderate: 6,
    cinematic: 10,
  };

  const result = await runWorkflowWithProgress(
    {
      workflow: "wan21-scene-gif",
      params: [
        {
          key: "2-inputs-prompt",
          value: params.sceneDescription,
        },
        { key: "2-inputs-duration", value: duration },
        {
          key: "2-inputs-motion_intensity",
          value: motionIntensity[params.style ?? "moderate"],
        },
        { key: "2-inputs-output_format", value: format },
        { key: "2-inputs-width", value: params.width ?? 512 },
        { key: "2-inputs-height", value: params.height ?? 768 },
      ],
      files,
    },
    options?.onProgress || (() => {})
  );

  return {
    ...result,
    videoUrl: result.outputUrls[0] || "",
    gifUrl: result.outputUrls[1],
    duration,
    format,
  };
}
