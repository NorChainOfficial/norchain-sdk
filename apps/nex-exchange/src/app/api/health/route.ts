import { NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

/**
 * Health check - proxies to Explorer API
 */
export async function GET() {
  try {
    const response = await fetch(API_CONFIG.endpoints.health);
    const data = await response.json();
    return NextResponse.json({
      ...data,
      frontend: "ok",
      api: response.ok ? "ok" : "error",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        frontend: "ok",
        api: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}

