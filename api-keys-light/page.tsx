
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Eye, EyeOff, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { localApiKeyStorage, StoredApiKey } from "@/lib/api-key-storage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PROVIDERS = [
  {
    value: "openai",
    label: "OpenAI",
    description: "GPT models for resume enhancement",
    setupUrl: "https://platform.openai.com/api-keys"
  },
  {
    value: "anthropic",
    label: "Anthropic Claude",
    description: "Claude models for professional writing",
    setupUrl: "https://console.anthropic.com/settings/keys"
  },
  {
    value: "gemini",
    label: "Google Gemini",
    description: "Gemini models for comprehensive analysis",
    setupUrl: "https://makersuite.google.com/app/apikey"
  }
];

export default function ApiKeysLightPage() {
  const [apiKeys, setApiKeys] = useState<StoredApiKey[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    provider: "",
    keyName: "",
    apiKey: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    const keys = localApiKeyStorage.getAll();
    setApiKeys(keys);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider || !formData.keyName || !formData.apiKey) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      console.log("[Light Mode] Saving API key:", { provider: formData.provider, keyName: formData.keyName });
      localApiKeyStorage.save(formData.provider, formData.keyName, formData.apiKey);
      console.log("[Light Mode] API key saved successfully");
      toast.success("API key saved successfully in browser storage");
      setIsDialogOpen(false);
      setFormData({ provider: "", keyName: "", apiKey: "" });
      loadApiKeys();
    } catch (error) {
      console.error("[Light Mode] Failed to save API key:", error);
      toast.error("Failed to save API key");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      localApiKeyStorage.delete(id);
      toast.success("API key deleted successfully");
      loadApiKeys();
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  const getProviderInfo = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider);
  };

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Key Management (Light Mode)</h1>
        <p className="text-gray-600 mb-4">
          Configure your LLM provider API keys - stored locally in your browser
        </p>
        
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Light Mode</AlertTitle>
          <AlertDescription>
            API keys are stored in your browser's localStorage. They won't sync across devices and will be lost if you clear your browser data. 
            For secure, persistent storage, <Link href="/auth/signin" className="text-orange-600 hover:underline font-medium">sign in</Link> and use the full database mode.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        {/* Add API Key Button */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add API Key</DialogTitle>
                  <DialogDescription>
                    Add a new LLM provider API key to enable resume enhancement features
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={formData.provider} onValueChange={(value) => setFormData({...formData, provider: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.provider && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{getProviderInfo(formData.provider)?.description}</span>
                        <Link 
                          href={getProviderInfo(formData.provider)?.setupUrl || "#"}
                          target="_blank"
                          className="text-orange-600 hover:underline flex items-center gap-1"
                        >
                          Get API Key <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., My OpenAI Key"
                      value={formData.keyName}
                      onChange={(e) => setFormData({...formData, keyName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter your API key"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    Save API Key
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* API Keys List */}
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys Configured</h3>
              <p className="text-gray-600 mb-4">
                Add your first API key to start enhancing resumes with AI
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {apiKeys.map((apiKey) => {
              const providerInfo = getProviderInfo(apiKey.provider);
              return (
                <Card key={apiKey.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Key className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{apiKey.keyName}</h3>
                          <p className="text-sm text-gray-600">
                            {providerInfo?.label || apiKey.provider} • Added {new Date(apiKey.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(apiKey.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Provider Information */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Providers</CardTitle>
            <CardDescription>
              Choose from these AI providers to power your resume enhancements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {PROVIDERS.map((provider) => (
                <Card key={provider.value} className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{provider.label}</h4>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                    <Link 
                      href={provider.setupUrl}
                      target="_blank"
                      className="text-sm text-orange-600 hover:underline flex items-center gap-1"
                    >
                      Get API Key <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
