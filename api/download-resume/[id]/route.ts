import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the enhancement
    const enhancement = await prisma.resumeEnhancement.findFirst({
      where: {
        id: params.id,
        resume: {
          userId: session.user.id,
        },
      },
      include: {
        resume: true,
      },
    });

    if (!enhancement) {
      return NextResponse.json(
        { message: "Enhancement not found" },
        { status: 404 }
      );
    }

    // Create a simple PDF with the enhanced content
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Add title
    doc.setFontSize(14);
    doc.text("Enhanced Resume", margin, margin);

    // Add enhancement type
    doc.setFontSize(10);
    doc.text(`Enhancement Type: ${enhancement.enhancementType}`, margin, margin + 10);
    doc.text(
      `Generated: ${new Date(enhancement.createdAt).toLocaleDateString()}`,
      margin,
      margin + 16
    );

    // Add content
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(
      enhancement.enhancedContent,
      maxWidth
    );
    doc.text(lines, margin, margin + 25);

    // Return as PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${enhancement.enhancementType}-${new Date().getTime()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error downloading resume:", error);
    return NextResponse.json(
      { message: "Failed to download resume" },
      { status: 500 }
    );
  }
}
