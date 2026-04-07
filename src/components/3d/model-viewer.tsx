"use client";

import { Suspense, useRef, useState, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Center,
  useGLTF,
  Html,
} from "@react-three/drei";
import {
  Grid3X3,
  Camera,
  Loader2,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as THREE from "three";

interface ModelViewerProps {
  url: string;
  className?: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function ScreenshotButton() {
  const { gl, scene, camera } = useThree();

  const handleScreenshot = useCallback(() => {
    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "model-screenshot.png";
    link.href = dataUrl;
    link.click();
  }, [gl, scene, camera]);

  return (
    <Html position={[0, 0, 0]} style={{ display: "none" }}>
      <button id="screenshot-btn" onClick={handleScreenshot} />
    </Html>
  );
}

export function ModelViewer({ url, className }: ModelViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "model-screenshot.png";
      link.href = dataUrl;
      link.click();
    }
  }, []);

  return (
    <div className={cn("relative bg-zinc-50 rounded-xl overflow-hidden", className)}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ background: "#fafafa" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />

        <Suspense
          fallback={
            <Html center>
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading model...</span>
              </div>
            </Html>
          }
        >
          <Model url={url} />
          <ScreenshotButton />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={1}
          maxDistance={10}
        />
        <Environment preset="studio" />

        {wireframe && <WireframeOverlay />}
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <button
          onClick={() => setWireframe(!wireframe)}
          className={cn(
            "p-2 rounded-lg text-xs transition-colors",
            wireframe
              ? "bg-zinc-900 text-white"
              : "bg-white/90 text-zinc-600 hover:bg-white shadow-sm"
          )}
          title="Toggle wireframe"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowSkeleton(!showSkeleton)}
          className={cn(
            "p-2 rounded-lg text-xs transition-colors",
            showSkeleton
              ? "bg-zinc-900 text-white"
              : "bg-white/90 text-zinc-600 hover:bg-white shadow-sm"
          )}
          title="Toggle skeleton"
        >
          <Box className="w-4 h-4" />
        </button>
        <button
          onClick={handleScreenshot}
          className="p-2 rounded-lg bg-white/90 text-zinc-600 hover:bg-white shadow-sm transition-colors"
          title="Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function WireframeOverlay() {
  const { scene } = useThree();

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.wireframe = true;
      } else if (Array.isArray(child.material)) {
        child.material.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) m.wireframe = true;
        });
      }
    }
  });

  return null;
}

// Placeholder for when no GLB is available
export function ModelViewerPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-zinc-50 rounded-xl flex flex-col items-center justify-center text-center p-8",
        className
      )}
    >
      <Box className="w-10 h-10 text-zinc-300 mb-3" />
      <p className="text-sm text-zinc-400">No 3D model available</p>
      <p className="text-xs text-zinc-300 mt-1">
        Upload a GLB file to view it here
      </p>
    </div>
  );
}
