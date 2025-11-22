import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSignedUrl } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    // Generate a signed URL for the Supabase Storage object
    const signedUrl = await getSignedUrl(resume.cloudStoragePath, 3600); // 1 hour

    return NextResponse.json({
      url: signedUrl,
      fileName: resume.originalName,
      fileType: resume.fileType,
    });

  } catch (error: any) {
    console.error("Error fetching resume file:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch resume file" },
      { status: 500 }
    );
  }
}
