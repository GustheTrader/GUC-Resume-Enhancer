
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ApiKeyManager } from "./_components/api-key-manager";

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Key Management</h1>
        <p className="text-gray-600">
          Configure your LLM provider API keys to enable resume enhancement features
        </p>
      </div>

      <ApiKeyManager />
    </div>
  );
}
