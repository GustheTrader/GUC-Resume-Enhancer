
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistoryList } from "./_components/history-list";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhancement History</h1>
        <p className="text-gray-600">
          View and manage all your previously enhanced resumes
        </p>
      </div>

      <HistoryList />
    </div>
  );
}
