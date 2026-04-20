import { NextRequest, NextResponse } from "next/server";

const COMICVINE_API = "https://comicvine.gamespot.com/api";
const API_KEY = process.env.COMICVINE_API_KEY!;

export interface ComicVineImage {
  id: number;
  name: string;
  image: {
    icon_url: string;
    medium_url: string;
    screen_url: string;
    screen_large_url: string;
    small_url: string;
    super_url: string;
    thumb_url: string;
    tiny_url: string;
    original_url: string;
  };
  deck: string | null;
  description: string | null;
  publisher?: { name: string } | null;
  first_appeared_in_issue?: { name: string; issue_number: string } | null;
  issue_number?: string;
  cover_date?: string;
  volume?: { name: string } | null;
  resource_type: string;
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function makeDemoResults(query: string, count = 12) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${query} — Issue ${i + 1}`,
    image: {
      icon_url: `https://picsum.photos/seed/${query}${i}/64/64`,
      medium_url: `https://picsum.photos/seed/${query}${i}/300/450`,
      screen_url: `https://picsum.photos/seed/${query}${i}/640/480`,
      screen_large_url: `https://picsum.photos/seed/${query}${i}/1280/960`,
      small_url: `https://picsum.photos/seed/${query}${i}/120/180`,
      super_url: `https://picsum.photos/seed/${query}${i}/600/900`,
      thumb_url: `https://picsum.photos/seed/${query}${i}/96/144`,
      tiny_url: `https://picsum.photos/seed/${query}${i}/32/48`,
      original_url: `https://picsum.photos/seed/${query}${i}/600/900`,
    },
    deck: `Demo reference for ${query}`,
    description: null,
    resource_type: "issue",
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const resource = searchParams.get("resource") || "characters";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (DEMO_MODE && query) {
    return NextResponse.json({
      results: makeDemoResults(query),
      total: 12,
      page,
      limit,
      offset: (page - 1) * limit,
    });
  }

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  try {
    let url: string;
    let fieldList: string;

    if (resource === "characters") {
      fieldList = "id,name,image,deck,publisher,first_appeared_in_issue";
      url = `${COMICVINE_API}/characters/?api_key=${API_KEY}&format=json&filter=name:${encodeURIComponent(query)}&field_list=${fieldList}&limit=${limit}&offset=${offset}`;
    } else {
      // Search issues for character cover art
      fieldList = "id,name,image,deck,issue_number,cover_date,volume";
      url = `${COMICVINE_API}/search/?api_key=${API_KEY}&format=json&query=${encodeURIComponent(query)}&resources=issue&field_list=${fieldList}&limit=${limit}&offset=${offset}`;
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "XMStudios-Pipeline/1.0" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `ComicVine API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (data.error !== "OK" && data.status_code !== 1) {
      return NextResponse.json(
        { error: data.error || "ComicVine API error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      results: data.results || [],
      total: data.number_of_total_results || 0,
      page,
      limit,
      offset,
    });
  } catch (err) {
    console.error("ComicVine API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch from ComicVine" },
      { status: 500 }
    );
  }
}
