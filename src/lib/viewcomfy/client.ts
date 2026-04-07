// ============================================================
// ViewComfy API Client — sends workflows, streams SSE progress
// ============================================================

const VIEWCOMFY_API_URL =
  process.env.VIEWCOMFY_API_URL || "http://localhost:3001/api";
const VIEWCOMFY_CLIENT_ID = process.env.VIEWCOMFY_CLIENT_ID || "";
const VIEWCOMFY_CLIENT_SECRET = process.env.VIEWCOMFY_CLIENT_SECRET || "";

// ── Types ──

export interface WorkflowParam {
  /** Format: "nodeId-inputs-paramName" */
  key: string;
  value: string | number | boolean;
}

export interface WorkflowFileInput {
  /** Format: "nodeId-inputs-paramName" */
  key: string;
  file: Blob | Buffer;
  filename: string;
}

export interface WorkflowRequest {
  /** Workflow JSON or workflow ID */
  workflow: string | Record<string, unknown>;
  /** Parameter overrides */
  params?: WorkflowParam[];
  /** File inputs (images, models) */
  files?: WorkflowFileInput[];
}

export interface WorkflowProgressEvent {
  type: "progress" | "log" | "preview" | "output" | "error" | "complete";
  progress?: number; // 0-100
  message?: string;
  previewUrl?: string;
  outputUrls?: string[];
  error?: string;
  nodeId?: string;
  timestamp: number;
}

export interface WorkflowResult {
  success: boolean;
  outputUrls: string[];
  error?: string;
  duration: number; // ms
  metadata?: Record<string, unknown>;
}

export type ProgressCallback = (event: WorkflowProgressEvent) => void;

// ── Auth Headers ──

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (VIEWCOMFY_CLIENT_ID && VIEWCOMFY_CLIENT_SECRET) {
    const credentials = Buffer.from(
      `${VIEWCOMFY_CLIENT_ID}:${VIEWCOMFY_CLIENT_SECRET}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }

  return headers;
}

// ── Retry Helper ──

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        const backoff = delayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  throw lastError;
}

// ── Upload Image ──

export async function uploadImage(
  file: Blob | Buffer,
  filename: string
): Promise<string> {
  const formData = new FormData();

  if (Buffer.isBuffer(file)) {
    // Convert Buffer to Blob via ArrayBuffer copy to satisfy strict TS
    const ab = file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength
    ) as ArrayBuffer;
    formData.append("file", new Blob([ab]), filename);
  } else {
    formData.append("file", file, filename);
  }

  const res = await withRetry(() =>
    fetch(`${VIEWCOMFY_API_URL}/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    })
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.url || data.filename || data.path;
}

// ── Download Output ──

export async function downloadOutput(url: string): Promise<Buffer> {
  const res = await withRetry(() =>
    fetch(url, {
      headers: getAuthHeaders(),
    })
  );

  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ── Run Workflow (non-streaming) ──

export async function runWorkflow(
  request: WorkflowRequest
): Promise<WorkflowResult> {
  const startTime = Date.now();

  const body = buildRequestBody(request);

  const res = await withRetry(() =>
    fetch(`${VIEWCOMFY_API_URL}/run`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300000), // 5 min timeout
    })
  );

  if (!res.ok) {
    const text = await res.text();
    return {
      success: false,
      outputUrls: [],
      error: `Workflow failed (${res.status}): ${text}`,
      duration: Date.now() - startTime,
    };
  }

  const data = await res.json();

  return {
    success: true,
    outputUrls: extractOutputUrls(data),
    duration: Date.now() - startTime,
    metadata: data,
  };
}

// ── Run Workflow with SSE Progress Streaming ──

export async function runWorkflowWithProgress(
  request: WorkflowRequest,
  onProgress: ProgressCallback
): Promise<WorkflowResult> {
  const startTime = Date.now();

  // Upload any file inputs first
  const uploadedFiles: Record<string, string> = {};
  if (request.files) {
    for (const fileInput of request.files) {
      onProgress({
        type: "log",
        message: `Uploading ${fileInput.filename}...`,
        timestamp: Date.now(),
      });
      const uploadedPath = await uploadImage(fileInput.file, fileInput.filename);
      uploadedFiles[fileInput.key] = uploadedPath;
    }
  }

  // Build request with uploaded file references
  const body = buildRequestBody(request, uploadedFiles);

  // Start the workflow with SSE streaming
  const res = await fetch(`${VIEWCOMFY_API_URL}/run/stream`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(600000), // 10 min timeout
  });

  if (!res.ok) {
    const text = await res.text();
    const error = `Workflow failed (${res.status}): ${text}`;
    onProgress({
      type: "error",
      error,
      timestamp: Date.now(),
    });
    return {
      success: false,
      outputUrls: [],
      error,
      duration: Date.now() - startTime,
    };
  }

  // Parse SSE stream
  const outputUrls: string[] = [];

  if (res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        let currentEventData = "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            currentEventData += line.slice(6);
          } else if (line === "" && currentEventData) {
            // End of event — parse and dispatch
            try {
              const event = JSON.parse(currentEventData);
              const progressEvent = parseSSEEvent(event);
              onProgress(progressEvent);

              if (progressEvent.outputUrls) {
                outputUrls.push(...progressEvent.outputUrls);
              }
            } catch {
              // Non-JSON event data — treat as log
              onProgress({
                type: "log",
                message: currentEventData,
                timestamp: Date.now(),
              });
            }
            currentEventData = "";
          }
        }
      }
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Stream reading failed";
      onProgress({
        type: "error",
        error,
        timestamp: Date.now(),
      });
      return {
        success: false,
        outputUrls,
        error,
        duration: Date.now() - startTime,
      };
    }
  }

  onProgress({
    type: "complete",
    progress: 100,
    outputUrls,
    message: "Workflow complete",
    timestamp: Date.now(),
  });

  return {
    success: true,
    outputUrls,
    duration: Date.now() - startTime,
  };
}

// ── Helpers ──

function buildRequestBody(
  request: WorkflowRequest,
  uploadedFiles?: Record<string, string>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  // Workflow can be an ID string or full JSON
  if (typeof request.workflow === "string") {
    body.workflow_id = request.workflow;
  } else {
    body.workflow = request.workflow;
  }

  // Parameters in "nodeId-inputs-paramName" format
  if (request.params) {
    const params: Record<string, string | number | boolean> = {};
    for (const p of request.params) {
      params[p.key] = p.value;
    }
    body.params = params;
  }

  // Include uploaded file references
  if (uploadedFiles) {
    const fileParams: Record<string, string> = {};
    for (const [key, path] of Object.entries(uploadedFiles)) {
      fileParams[key] = path;
    }
    body.file_params = fileParams;
  }

  return body;
}

function parseSSEEvent(
  data: Record<string, unknown>
): WorkflowProgressEvent {
  // ViewComfy SSE events may have different shapes
  // Normalize them into our WorkflowProgressEvent format

  const type = (data.type as string) || "log";
  const event: WorkflowProgressEvent = {
    type: type as WorkflowProgressEvent["type"],
    timestamp: Date.now(),
  };

  if (data.progress !== undefined) {
    event.progress = Number(data.progress);
    event.type = "progress";
  }

  if (data.message || data.log || data.text) {
    event.message =
      (data.message as string) ||
      (data.log as string) ||
      (data.text as string);
  }

  if (data.preview_url || data.preview) {
    event.previewUrl =
      (data.preview_url as string) || (data.preview as string);
    event.type = "preview";
  }

  if (data.output_urls || data.outputs || data.images) {
    event.outputUrls = (data.output_urls ||
      data.outputs ||
      data.images) as string[];
    event.type = "output";
  }

  if (data.error) {
    event.error = data.error as string;
    event.type = "error";
  }

  if (data.node_id || data.nodeId) {
    event.nodeId = (data.node_id || data.nodeId) as string;
  }

  return event;
}

function extractOutputUrls(data: Record<string, unknown>): string[] {
  // Try various response shapes
  if (Array.isArray(data.output_urls)) return data.output_urls as string[];
  if (Array.isArray(data.outputs)) return data.outputs as string[];
  if (Array.isArray(data.images)) return data.images as string[];
  if (typeof data.url === "string") return [data.url];
  if (typeof data.output === "string") return [data.output];
  return [];
}

// ── Health Check ──

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${VIEWCOMFY_API_URL}/health`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
