import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  author: string;
}

function parseRSSItem(item: string): Partial<SubstackPost> {
  const getTag = (tag: string) => {
    const match = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
    return match ? (match[1] || match[2] || "").trim() : "";
  };

  return {
    title: getTag("title"),
    link: getTag("link"),
    pubDate: getTag("pubDate"),
    description: getTag("description"),
    author: getTag("dc:creator") || getTag("author"),
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rssUrl } = body;

    if (!rssUrl) {
      return NextResponse.json({ error: "rssUrl is required" }, { status: 400 });
    }

    // Fetch RSS feed
    const response = await fetch(rssUrl, {
      headers: { "User-Agent": "Atlas Engine RSS Fetcher/1.0" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch RSS feed: ${response.status}` },
        { status: 400 }
      );
    }

    const xml = await response.text();

    // Extract channel metadata
    const channelTitle = xml.match(/<channel>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() || "";
    const channelDescription = xml.match(/<channel>[\s\S]*?<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.trim() || "";

    // Extract items
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const posts = itemMatches.slice(0, 20).map((item) => parseRSSItem(item));

    return NextResponse.json({
      success: true,
      channel: { title: channelTitle, description: channelDescription },
      posts,
      count: posts.length,
    });
  } catch (error: any) {
    console.error("Substack fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Substack feed", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rssUrl = searchParams.get("url");

  if (!rssUrl) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch feed" }, { status: 400 });
    }

    const xml = await response.text();
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const posts = itemMatches.slice(0, 10).map((item) => parseRSSItem(item));

    return NextResponse.json({ posts, count: posts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
