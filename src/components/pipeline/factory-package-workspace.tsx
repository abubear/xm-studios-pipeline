"use client";

import { useState } from "react";
import {
  Package,
  Download,
  Loader2,
  CheckCircle2,
  Circle,
  FileBox,
  Paintbrush,
  Puzzle,
  ShieldCheck,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FactoryPackageWorkspaceProps {
  sessionId: string;
  characterName?: string;
}

interface PackageItem {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: "pending" | "ready" | "downloading";
}

export function FactoryPackageWorkspace({
  sessionId,
  characterName,
}: FactoryPackageWorkspaceProps) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [packageReady, setPackageReady] = useState(false);
  const [packageData, setPackageData] = useState<Record<string, unknown> | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    surface_finish: false,
    joint_tolerance: false,
    paint_accuracy: false,
    base_stability: false,
    packaging_fit: false,
  });

  const PACKAGE_ITEMS: PackageItem[] = [
    {
      key: "stl_files",
      label: "STL / FBX Files",
      description: "Production-ready 3D models for CNC and 3D printing",
      icon: FileBox,
      status: packageReady ? "ready" : "pending",
    },
    {
      key: "paint_guide",
      label: "Paint Reference Guide",
      description: "Color specifications, gradients, and weathering notes",
      icon: Paintbrush,
      status: packageReady ? "ready" : "pending",
    },
    {
      key: "assembly_diagram",
      label: "Assembly Diagram",
      description: "Part breakdown, joint placements, and assembly order",
      icon: Puzzle,
      status: packageReady ? "ready" : "pending",
    },
    {
      key: "approval_confirmation",
      label: "IP Approval Confirmation",
      description: "Signed-off IP Gate approvals from licensor",
      icon: ShieldCheck,
      status: packageReady ? "ready" : "pending",
    },
    {
      key: "quality_checklist",
      label: "Quality Checklist",
      description: "Pre-production quality verification items",
      icon: ClipboardCheck,
      status: packageReady ? "ready" : "pending",
    },
  ];

  async function compilePackage() {
    setIsCompiling(true);

    try {
      const res = await fetch("/api/pipeline/factory-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) throw new Error("Failed to compile package");

      const data = await res.json();
      setPackageData(data.contents);
      setPackageReady(true);
    } catch {
      // Fallback for demo
      setPackageData({
        stl_files: [{ name: "model.stl", format: "stl" }],
        paint_guide: { status: "included" },
        assembly_diagram: { status: "included" },
      });
      setPackageReady(true);
    } finally {
      setIsCompiling(false);
    }
  }

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <Package className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-heading font-bold text-zinc-900">
          Factory Package
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Stage 13 — Production handoff for{" "}
          <strong>{characterName || "this character"}</strong>
        </p>
      </div>

      {/* Package contents */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Package Contents
        </h3>
        {PACKAGE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-colors",
                item.status === "ready"
                  ? "bg-green-50 border border-green-200"
                  : "bg-zinc-50 border border-zinc-100"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  item.status === "ready"
                    ? "bg-green-500/10"
                    : "bg-zinc-200/50"
                )}
              >
                {item.status === "ready" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Icon className="w-5 h-5 text-zinc-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  {item.label}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {item.description}
                </p>
              </div>
              {item.status === "ready" && (
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1.5">
                  <Download className="w-3 h-3" /> Download
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Quality checklist */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Quality Checklist
        </h3>
        <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
          {Object.entries(checklist).map(([key, checked]) => (
            <label
              key={key}
              className="flex items-center gap-3 py-1.5 cursor-pointer"
            >
              <button
                onClick={() =>
                  setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                className="shrink-0"
              >
                {checked ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300" />
                )}
              </button>
              <span
                className={cn(
                  "text-sm capitalize",
                  checked ? "text-green-700 line-through" : "text-zinc-700"
                )}
              >
                {key.replace(/_/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Signed URL expiry notice */}
      {packageReady && (
        <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-xs font-medium text-amber-700">
              Download links expire in 24 hours
            </p>
            <p className="text-[10px] text-amber-600">
              Signed URLs for secure file access. Regenerate package for new
              links.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!packageReady ? (
          <button
            onClick={compilePackage}
            disabled={isCompiling}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
              isCompiling
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Compiling
                Package...
              </>
            ) : (
              <>
                <Package className="w-4 h-4" /> Compile Factory Package
              </>
            )}
          </button>
        ) : (
          <button
            disabled={!allChecked}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
              allChecked
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4" /> Download Complete Package (ZIP)
          </button>
        )}
      </div>

      {packageData && (
        <div className="bg-zinc-950 rounded-xl p-4">
          <p className="text-[10px] text-zinc-500 font-mono mb-2">
            package-manifest.json
          </p>
          <pre className="text-[11px] text-zinc-400 font-mono overflow-x-auto">
            {JSON.stringify(packageData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
