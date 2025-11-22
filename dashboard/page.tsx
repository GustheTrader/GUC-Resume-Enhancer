
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadSection } from "./_components/upload-section";
import { RecentResumes } from "./_components/recent-resumes";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user?.firstName || session.user?.name}!
        </h1>
        <p className="text-gray-600">
          Upload a resume to get started with AI-powered enhancements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UploadSection />
        </div>
        <div className="lg:col-span-1">
          <RecentResumes />
        </div>
      </div>
    </div>
  );
}
