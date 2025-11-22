
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
import { Key, Plus, Trash2, Eye, EyeOff, ExternalLink, Cpu } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getModelsForProvider, getDefaultModel } from "@/lib/llm-models";

interface ApiKey {
  id: string;
  provider: string;
  keyName: string;
  defaultModel: string;
  isActive: boolean;
  createdAt: string;
}

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

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    provider: "",
    keyName: "",
    apiKey: "",
    defaultModel: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Update available models when provider changes
  useEffect(() => {
    if (formData.provider) {
      const models = getModelsForProvider(formData.provider);
      setAvailableModels(models);
      // Set default model if not already set
      if (!formData.defaultModel && models.length > 0) {
        setFormData(prev => ({ ...prev, defaultModel: models[0].value }));
      }
    } else {
      setAvailableModels([]);
    }
  }, [formData.provider]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      } else {
        console.error("Failed to fetch API keys:", response.status, response.statusText);
        if (response.status === 401) {
          toast.error("Please sign in to manage API keys");
        }
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider || !formData.keyName || !formData.apiKey || !formData.defaultModel) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting API key:", { 
        provider: formData.provider, 
        keyName: formData.keyName,
        defaultModel: formData.defaultModel 
      });
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API key saved:", data);
        toast.success("API key saved successfully with " + formData.defaultModel);
        setIsDialogOpen(false);
        setFormData({ provider: "", keyName: "", apiKey: "", defaultModel: "" });
        fetchApiKeys();
      } else {
        const data = await response.json();
        console.error("Failed to save API key:", data);
        toast.error(data.message || "Failed to save API key");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Something went wrong. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("API key deleted successfully");
        fetchApiKeys();
      } else {
        toast.error("Failed to delete API key");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const getProviderInfo = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
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
                  <Label htmlFor="defaultModel">Default Model</Label>
                  <Select 
                    value={formData.defaultModel} 
                    onValueChange={(value) => setFormData({...formData, defaultModel: value})}
                    disabled={!formData.provider}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.provider ? "Select a model" : "Select a provider first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.label}</span>
                            <span className="text-xs text-gray-500">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.provider && (
                    <p className="text-sm text-gray-600">
                      This model will be used by default for resume enhancements
                    </p>
                  )}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save API Key"}
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{apiKey.keyName}</h3>
                          <Badge variant="outline" className="text-xs">
                            <Cpu className="h-3 w-3 mr-1" />
                            {apiKey.defaultModel}
                          </Badge>
                        </div>
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
  );
}
