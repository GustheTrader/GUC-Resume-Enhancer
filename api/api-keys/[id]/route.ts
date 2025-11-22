
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = await prisma.userApiKey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { message: "API key not found" },
        { status: 404 }
      );
    }

    await prisma.userApiKey.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      message: "API key deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { message: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
