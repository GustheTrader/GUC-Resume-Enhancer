import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for AI processing

// Helper to call OpenAI
async function enhanceWithOpenAI(apiKey: string, model: string, content: string, enhancementType: string) {
  const prompts: Record<string, string> = {
    skills_certifications: `Enhance the following resume by highlighting trade skills, licenses, and certifications. Make them prominent and well-formatted:\n\n${content}`,
    project_experience: `Enhance the following resume by showcasing completed projects and technical expertise. Use strong action verbs:\n\n${content}`,
    client_quality: `Enhance the following resume by emphasizing customer satisfaction, quality work, and client success stories:\n\n${content}`,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer specializing in trade and technical resumes. Format your response in clean, professional markdown.',
        },
        {
          role: 'user',
          content: prompts[enhancementType] || prompts.client_quality,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Helper to call Anthropic
async function enhanceWithAnthropic(apiKey: string, model: string, content: string, enhancementType: string) {
  const prompts: Record<string, string> = {
    skills_certifications: `Enhance the following resume by highlighting trade skills, licenses, and certifications. Make them prominent and well-formatted:\n\n${content}`,
    project_experience: `Enhance the following resume by showcasing completed projects and technical expertise. Use strong action verbs:\n\n${content}`,
    client_quality: `Enhance the following resume by emphasizing customer satisfaction, quality work, and client success stories:\n\n${content}`,
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompts[enhancementType] || prompts.client_quality,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Helper to call Google Gemini
async function enhanceWithGemini(apiKey: string, model: string, content: string, enhancementType: string) {
  const prompts: Record<string, string> = {
    skills_certifications: `Enhance the following resume by highlighting trade skills, licenses, and certifications. Make them prominent and well-formatted:\n\n${content}`,
    project_experience: `Enhance the following resume by showcasing completed projects and technical expertise. Use strong action verbs:\n\n${content}`,
    client_quality: `Enhance the following resume by emphasizing customer satisfaction, quality work, and client success stories:\n\n${content}`,
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompts[enhancementType] || prompts.client_quality,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { enhancementType } = await req.json();

    if (!enhancementType) {
      return NextResponse.json({ message: "Enhancement type is required" }, { status: 400 });
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

    // Get user's active API key
    const userApiKey = await prisma.userApiKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!userApiKey) {
      return NextResponse.json(
        { message: "No active API key found. Please configure your API keys in settings." },
        { status: 400 }
      );
    }

    // Decrypt the API key
    const apiKey = decryptApiKey(userApiKey.encryptedKey);

    // Create enhancement record
    const enhancement = await prisma.resumeEnhancement.create({
      data: {
        resumeId: resume.id,
        enhancementType,
        llmProvider: userApiKey.provider,
        status: 'processing',
        enhancedContent: '',
      },
    });

    try {
      // Call appropriate AI provider
      let enhancedContent: string;

      switch (userApiKey.provider) {
        case 'openai':
          enhancedContent = await enhanceWithOpenAI(apiKey, userApiKey.defaultModel, resume.originalContent, enhancementType);
          break;
        case 'anthropic':
          enhancedContent = await enhanceWithAnthropic(apiKey, userApiKey.defaultModel, resume.originalContent, enhancementType);
          break;
        case 'gemini':
          enhancedContent = await enhanceWithGemini(apiKey, userApiKey.defaultModel, resume.originalContent, enhancementType);
          break;
        default:
          throw new Error(`Unsupported provider: ${userApiKey.provider}`);
      }

      // Update enhancement with result
      const updatedEnhancement = await prisma.resumeEnhancement.update({
        where: { id: enhancement.id },
        data: {
          enhancedContent,
          status: 'completed',
        },
      });

      await logger.info('resume_enhancement', `Resume enhanced successfully with ${userApiKey.provider}`, {
        resumeId: resume.id,
        enhancementType,
        provider: userApiKey.provider,
      }, session.user.id);

      return NextResponse.json({
        success: true,
        enhancement: updatedEnhancement,
      });

    } catch (error: any) {
      // Update enhancement status to error
      await prisma.resumeEnhancement.update({
        where: { id: enhancement.id },
        data: {
          status: 'error',
          enhancementNotes: error.message,
        },
      });

      await logger.error('resume_enhancement', `Enhancement failed: ${error.message}`, {
        resumeId: resume.id,
        enhancementType,
        error: error.message,
      }, session.user.id);

      throw error;
    }

  } catch (error: any) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      { message: error.message || "Enhancement failed" },
      { status: 500 }
    );
  }
}
