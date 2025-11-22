
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { EnhanceInterface } from "./_components/enhance-interface";

interface Props {
  params: {
    id: string;
  };
}

export default async function EnhancePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      enhancements: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!resume) {
    redirect("/dashboard");
  }

  const userApiKeys = await prisma.userApiKey.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <EnhanceInterface 
        resume={{
          ...resume,
          createdAt: resume.createdAt.toISOString(),
          updatedAt: resume.updatedAt.toISOString(),
          enhancements: resume.enhancements.map(e => ({
            ...e,
            createdAt: e.createdAt.toISOString(),
            updatedAt: e.updatedAt.toISOString(),
          })),
        }}
        hasApiKeys={userApiKeys.length > 0}
      />
    </div>
  );
}
