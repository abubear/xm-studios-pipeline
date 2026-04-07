import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/viewcomfy/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const connected = await checkHealth();
  return NextResponse.json({ connected });
}
