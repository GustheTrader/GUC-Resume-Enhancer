import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "@/lib/logger";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const dynamic = "force-dynamic";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Extract text from PDF
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

// Extract text from DOCX
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only PDF and DOCX files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text content
    let extractedText: string;
    const fileType = file.type === "application/pdf" ? "pdf" : "docx";

    if (fileType === "pdf") {
      extractedText = await extractPdfText(buffer);
    } else {
      extractedText = await extractDocxText(buffer);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { message: "Could not extract text from the file. Please ensure the file contains readable text." },
        { status: 400 }
      );
    }

    // Upload to S3
    const fileName = `resumes/${session.user.id}/${Date.now()}-${file.name}`;
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "",
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(uploadCommand);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        originalName: file.name,
        cloudStoragePath: fileName,
        fileType,
        originalContent: extractedText,
        status: "uploaded",
      },
    });

    await logger.info("resume_upload", "Resume uploaded successfully", {
      resumeId: resume.id,
      fileName: file.name,
      fileType,
      fileSize: file.size,
    }, session.user.id);

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        originalName: resume.originalName,
        fileType: resume.fileType,
        status: resume.status,
        createdAt: resume.createdAt.toISOString(),
      },
    });

  } catch (error: any) {
    console.error("Upload error:", error);

    try {
      const session = await getServerSession(authOptions);
      await logger.error("resume_upload", `Upload failed: ${error.message}`, {
        error: error.message,
      }, session?.user?.id);
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return NextResponse.json(
      { message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
