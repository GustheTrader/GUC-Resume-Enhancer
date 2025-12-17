import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

const PASSWORD_MIN_LENGTH = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP address - max 5 signup attempts per 15 minutes
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `signup:${ip}`;

    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { message: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password, firstName, lastName, companyName } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length (frontend also enforces this, but validate on backend)
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        companyName: companyName || undefined,
        name: `${firstName || ""} ${lastName || ""}`.trim() || email,
      },
    });

    // Log user creation
    await logger.info(
      "auth",
      `User account created`,
      {
        userId: user.id,
        email: user.email,
      },
      user.id
    );

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      { message: "Failed to create user account" },
      { status: 500 }
    );
  }
}
