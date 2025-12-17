import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadFileFromSupabase } from "@/lib/supabase-storage";

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

    // Fetch the file from Supabase Storage
    const blob = await downloadFileFromSupabase(resume.cloudStoragePath);

    // Convert blob to buffer
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return the PDF with proper headers - CORS restricted to same origin
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${resume.originalName}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    // Don't log sensitive error details in console
    return NextResponse.json(
      { message: "Failed to fetch PDF" },
      { status: 500 }
    );
  }
}
