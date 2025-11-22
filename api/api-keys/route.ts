
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptApiKey } from "@/lib/crypto";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKeys = await prisma.userApiKey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        provider: true,
        keyName: true,
        defaultModel: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      apiKeys: apiKeys.map(key => ({
        ...key,
        createdAt: key.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { message: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[API] POST /api/api-keys - Starting");
    const session = await getServerSession(authOptions);
    console.log("[API] Session:", session ? `User ID: ${session.user?.id}` : "No session");

    if (!session?.user?.id) {
      console.log("[API] Unauthorized - No session or user ID");
      return NextResponse.json(
        { message: "Unauthorized. Please sign in to save API keys." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { provider, keyName, apiKey, defaultModel } = body;
    console.log("[API] Request body:", { provider, keyName, defaultModel, apiKeyLength: apiKey?.length });

    if (!provider || !keyName || !apiKey || !defaultModel) {
      console.log("[API] Missing fields:", { 
        provider: !!provider, 
        keyName: !!keyName, 
        apiKey: !!apiKey,
        defaultModel: !!defaultModel 
      });
      await logger.warning("api_key", "API key save failed: missing fields", {
        provider,
        keyName,
        hasApiKey: !!apiKey,
        hasDefaultModel: !!defaultModel,
      }, session.user.id);
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has an API key for this provider
    console.log("[API] Checking for existing key...");
    const existingKey = await prisma.userApiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider,
        },
      },
    });

    if (existingKey) {
      console.log("[API] Existing key found for provider:", provider);
      await logger.warning("api_key", `Duplicate API key save attempt for ${provider}`, {
        provider,
        keyName,
      }, session.user.id);
      return NextResponse.json(
        { message: "You already have an API key for this provider. Please delete the existing one first." },
        { status: 400 }
      );
    }

    // Encrypt the API key
    console.log("[API] Encrypting API key...");
    const encryptedKey = encryptApiKey(apiKey);
    console.log("[API] API key encrypted successfully");

    // Save to database
    console.log("[API] Saving to database...");
    const userApiKey = await prisma.userApiKey.create({
      data: {
        userId: session.user.id,
        provider,
        keyName,
        encryptedKey,
        defaultModel,
        isActive: true,
      },
    });
    console.log("[API] API key saved successfully:", userApiKey.id);

    // Log success
    await logger.info("api_key", `API key saved successfully for ${provider}`, {
      provider,
      keyName,
      defaultModel,
      apiKeyId: userApiKey.id,
    }, session.user.id);

    return NextResponse.json({
      message: "API key saved successfully",
      apiKey: {
        id: userApiKey.id,
        provider: userApiKey.provider,
        keyName: userApiKey.keyName,
        defaultModel: userApiKey.defaultModel,
        isActive: userApiKey.isActive,
        createdAt: userApiKey.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[API] Error saving API key:", error);
    console.error("[API] Error stack:", error?.stack);
    
    // Log error
    try {
      const session = await getServerSession(authOptions);
      await logger.error("api_key", `Failed to save API key: ${error?.message || 'Unknown error'}`, {
        error: error?.message,
        stack: error?.stack,
      }, session?.user?.id);
    } catch (logError) {
      console.error("[API] Failed to log error:", logError);
    }

    return NextResponse.json(
      { message: `Failed to save API key: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
