// ============================================================
// ViewComfy Workflow Parameter Mappings
// Maps readable parameter names → "nodeId-inputs-paramName" keys
// Update these when workflow_api.json files change in ComfyUI
// ============================================================

export interface ParamMapping {
  /** Human-readable name used in our app */
  name: string;
  /** ViewComfy key format: "nodeId-inputs-paramName" */
  key: string;
  /** Expected type */
  type: "string" | "number" | "boolean" | "file";
  /** Default value (if any) */
  default?: string | number | boolean;
  /** Description for documentation */
  description?: string;
}

export interface WorkflowConfig {
  /** Workflow identifier sent to ViewComfy */
  workflowId: string;
  /** Display name */
  name: string;
  /** Parameter mappings */
  params: Record<string, ParamMapping>;
}

// ── 1. Jake's QWen ModelSheet (Stage 03: Mass Generation) ──

export const QWEN_MASS_GENERATION: WorkflowConfig = {
  workflowId: "qwen-mass-generation",
  name: "QWen Mass Generation",
  params: {
    referenceImage: {
      name: "Reference Image",
      key: "1-inputs-image",
      type: "file",
      description: "Master reference image from Scene Composer",
    },
    prompt: {
      name: "Prompt",
      key: "2-inputs-text",
      type: "string",
      description: "Text prompt describing the desired concept",
    },
    negativePrompt: {
      name: "Negative Prompt",
      key: "2-inputs-negative",
      type: "string",
      default: "",
      description: "What to avoid in generation",
    },
    batchSize: {
      name: "Batch Size",
      key: "3-inputs-batch_size",
      type: "number",
      default: 1000,
      description: "Number of images to generate",
    },
    width: {
      name: "Width",
      key: "3-inputs-width",
      type: "number",
      default: 768,
    },
    height: {
      name: "Height",
      key: "3-inputs-height",
      type: "number",
      default: 1024,
    },
    steps: {
      name: "Steps",
      key: "3-inputs-steps",
      type: "number",
      default: 30,
    },
    cfgScale: {
      name: "CFG Scale",
      key: "3-inputs-cfg_scale",
      type: "number",
      default: 7.5,
    },
    seed: {
      name: "Seed",
      key: "3-inputs-seed",
      type: "number",
      description: "Random seed (-1 for random)",
    },
  },
};

// ── 2. Jake's QWen ModelSheet Advanced (Stage 08: Multi-Angle) ──

export const QWEN_MULTI_ANGLE: WorkflowConfig = {
  workflowId: "qwen-multi-angle",
  name: "QWen Multi-Angle Turnaround",
  params: {
    conceptImage: {
      name: "Concept Image",
      key: "1-inputs-image",
      type: "file",
      description: "Approved concept image from voting",
    },
    prompt: {
      name: "Prompt",
      key: "2-inputs-text",
      type: "string",
      default: "Generate multi-angle views of this character statue",
    },
    angles: {
      name: "Angles",
      key: "3-inputs-angles",
      type: "string",
      default: "front,side,back,quarter",
      description: "Comma-separated list of camera angles",
    },
    width: {
      name: "Width",
      key: "3-inputs-width",
      type: "number",
      default: 1024,
    },
    height: {
      name: "Height",
      key: "3-inputs-height",
      type: "number",
      default: 1024,
    },
  },
};

// ── 3. Pixel Artistry Trellis 2 (Stage 09: 3D Generation) ──

export const TRELLIS2_GENERATE: WorkflowConfig = {
  workflowId: "trellis2-generate",
  name: "Trellis 2 — 3D Model Generation",
  params: {
    frontImage: {
      name: "Front View",
      key: "1-inputs-front_image",
      type: "file",
      description: "Front view PNG from multi-angle turnaround",
    },
    topImage: {
      name: "Top View",
      key: "2-inputs-top_image",
      type: "file",
      description: "Top view PNG from multi-angle turnaround",
    },
    format: {
      name: "Output Format",
      key: "3-inputs-format",
      type: "string",
      default: "glb",
      description: "3D file format: glb, obj, or fbx",
    },
    resolution: {
      name: "Mesh Resolution",
      key: "3-inputs-resolution",
      type: "number",
      default: 512,
      description: "Mesh resolution (higher = more polygons)",
    },
  },
};

// ── 4. UniRig Auto-Rig (Stage 10: Rigging) ──

export const UNIRIG_AUTO_RIG: WorkflowConfig = {
  workflowId: "unirig-auto-rig",
  name: "UniRig — Auto Rigging",
  params: {
    model: {
      name: "3D Model",
      key: "1-inputs-model",
      type: "file",
      description: "GLB model from Trellis 2",
    },
    skeletonType: {
      name: "Skeleton Type",
      key: "2-inputs-skeleton_type",
      type: "string",
      default: "humanoid",
      description: "humanoid, quadruped, or custom",
    },
    outputFormat: {
      name: "Output Format",
      key: "2-inputs-output_format",
      type: "string",
      default: "fbx",
    },
  },
};

// ── 5. SV3D Turntable (Store Content: 360° Video) ──

export const SV3D_TURNTABLE: WorkflowConfig = {
  workflowId: "sv3d-turntable",
  name: "SV3D — 360° Turntable Video",
  params: {
    heroImage: {
      name: "Hero Image",
      key: "1-inputs-image",
      type: "file",
      description: "Hero render for turntable",
    },
    frameCount: {
      name: "Frame Count",
      key: "2-inputs-frame_count",
      type: "number",
      default: 24,
      description: "Number of frames (12-36)",
    },
    elevation: {
      name: "Camera Elevation",
      key: "2-inputs-elevation",
      type: "number",
      default: 15,
      description: "Camera elevation in degrees (-15 to 45)",
    },
    outputFormat: {
      name: "Output Format",
      key: "2-inputs-output_format",
      type: "string",
      default: "mp4",
      description: "mp4, gif, or webm",
    },
    background: {
      name: "Background",
      key: "2-inputs-background",
      type: "string",
      default: "studio",
      description: "transparent, white, or studio",
    },
    width: {
      name: "Width",
      key: "2-inputs-width",
      type: "number",
      default: 1024,
    },
    height: {
      name: "Height",
      key: "2-inputs-height",
      type: "number",
      default: 1024,
    },
  },
};

// ── 6. ComfyUI 3D Pack Multi-Angle (Store Content: Hero Shots) ──

export const MULTI_ANGLE_RENDERS: WorkflowConfig = {
  workflowId: "multi-angle-renders",
  name: "3D Pack — Multi-Angle Renders",
  params: {
    model: {
      name: "3D Model",
      key: "1-inputs-model",
      type: "file",
      description: "GLB model to render from multiple angles",
    },
    angles: {
      name: "Camera Angles",
      key: "2-inputs-angles",
      type: "string",
      default: "front,front-quarter,side,back-quarter,back,top-down,low-angle,face-detail",
      description: "Comma-separated camera angle names",
    },
    lighting: {
      name: "Lighting Preset",
      key: "2-inputs-lighting",
      type: "string",
      default: "studio",
      description: "studio, dramatic, or natural",
    },
    resolution: {
      name: "Resolution",
      key: "2-inputs-resolution",
      type: "number",
      default: 2048,
      description: "Output resolution: 1024, 2048, or 4096",
    },
    background: {
      name: "Background",
      key: "2-inputs-background",
      type: "string",
      default: "studio",
    },
  },
};

// ── 7. Wan2.1 Image-to-Video (Store Content: Animated Scene GIFs) ──

export const WAN21_SCENE_GIF: WorkflowConfig = {
  workflowId: "wan21-scene-gif",
  name: "Wan2.1 — Animated Scene GIF",
  params: {
    heroImage: {
      name: "Hero Image",
      key: "1-inputs-image",
      type: "file",
      description: "Hero concept image to animate",
    },
    prompt: {
      name: "Scene Description",
      key: "2-inputs-prompt",
      type: "string",
      description: "Text describing the desired animation",
    },
    duration: {
      name: "Duration",
      key: "2-inputs-duration",
      type: "number",
      default: 3,
      description: "Animation duration in seconds (2, 3, or 5)",
    },
    motionIntensity: {
      name: "Motion Intensity",
      key: "2-inputs-motion_intensity",
      type: "number",
      default: 6,
      description: "Motion intensity: 3 (subtle), 6 (moderate), 10 (cinematic)",
    },
    outputFormat: {
      name: "Output Format",
      key: "2-inputs-output_format",
      type: "string",
      default: "mp4",
    },
    width: {
      name: "Width",
      key: "2-inputs-width",
      type: "number",
      default: 512,
    },
    height: {
      name: "Height",
      key: "2-inputs-height",
      type: "number",
      default: 768,
    },
  },
};

// ── Lookup helper ──

export const ALL_WORKFLOWS: Record<string, WorkflowConfig> = {
  "qwen-mass-generation": QWEN_MASS_GENERATION,
  "qwen-multi-angle": QWEN_MULTI_ANGLE,
  "trellis2-generate": TRELLIS2_GENERATE,
  "unirig-auto-rig": UNIRIG_AUTO_RIG,
  "sv3d-turntable": SV3D_TURNTABLE,
  "multi-angle-renders": MULTI_ANGLE_RENDERS,
  "wan21-scene-gif": WAN21_SCENE_GIF,
};

/** Get the ViewComfy key for a workflow param by readable name */
export function getParamKey(
  workflowId: string,
  paramName: string
): string | undefined {
  return ALL_WORKFLOWS[workflowId]?.params[paramName]?.key;
}

/** Get all file-type params for a workflow (for upload handling) */
export function getFileParams(workflowId: string): ParamMapping[] {
  const config = ALL_WORKFLOWS[workflowId];
  if (!config) return [];
  return Object.values(config.params).filter((p) => p.type === "file");
}
